import os
from fastapi import FastAPI, Depends, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session
from .db import SessionLocal
from . import models
from .auth import hash_password, check_password, make_token, decode_token
import requests
from datetime import datetime
import json
import stripe
from collections import defaultdict


app = FastAPI(title="Upwork Autoresponder (Python)")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_user(req: Request) -> dict:
    auth = req.headers.get('authorization')
    if not auth or not auth.lower().startswith('bearer '):
        raise HTTPException(status_code=401, detail='unauthorized')
    token = auth.split(' ', 1)[1]
    payload = decode_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail='invalid token')
    return payload


class SignupBody(BaseModel):
    email: str
    password: str


@app.post('/auth/signup')
def signup(body: SignupBody, db: Session = Depends(get_db)):
    user = db.query(models.User).filter_by(email=body.email).first()
    if user:
        raise HTTPException(status_code=400, detail='exists')
    user = models.User(email=body.email, hashedPw=hash_password(body.password))
    db.add(user)
    db.commit()
    db.refresh(user)
    return { 'id': user.id, 'email': user.email }


class LoginBody(BaseModel):
    email: str
    password: str


@app.post('/auth/login')
def login(body: LoginBody, db: Session = Depends(get_db)):
    user = db.query(models.User).filter_by(email=body.email).first()
    if not user or not check_password(body.password, user.hashedPw):
        raise HTTPException(status_code=401, detail='invalid credentials')
    token = make_token(user.id, user.email, user.role.value)
    return { 'access_token': token, 'user': { 'id': user.id, 'email': user.email } }


@app.get('/me')
def me(u=Depends(get_user)):
    return { 'id': u['sub'], 'email': u.get('email'), 'role': u.get('role') }


class ApiKeyBody(BaseModel):
    alias: str | None = None
    upworkKey: str
    upworkSecret: str


@app.get('/api-keys')
def list_keys(u=Depends(get_user), db: Session = Depends(get_db)):
    rows = db.query(models.ApiKey).filter_by(userId=u['sub']).order_by(models.ApiKey.createdAt.desc()).all()
    return [
        {
            'id': r.id,
            'alias': r.alias,
            'createdAt': r.createdAt.isoformat(),
        } for r in rows
    ]


@app.post('/api-keys')
def create_key(body: ApiKeyBody, u=Depends(get_user), db: Session = Depends(get_db)):
    key = models.ApiKey(userId=u['sub'], alias=body.alias, upworkKey=body.upworkKey, upworkSecret=body.upworkSecret)
    db.add(key)
    db.commit()
    db.refresh(key)
    return { 'id': key.id, 'alias': key.alias }


@app.get('/proposals')
def list_proposals(status: str | None = None, u=Depends(get_user), db: Session = Depends(get_db)):
    q = db.query(models.Proposal).filter_by(userId=u['sub'])
    if status:
        q = q.filter_by(status=status)
    rows = q.order_by(models.Proposal.createdAt.desc()).all()
    return [
        {
            'id': r.id,
            'jobTitle': r.jobTitle,
            'draft': r.draft,
            'status': r.status.value if hasattr(r.status, 'value') else r.status,
        } for r in rows
    ]


@app.post('/proposals/{pid}/send')
def send_proposal(pid: str, u=Depends(get_user), db: Session = Depends(get_db)):
    p = db.query(models.Proposal).filter_by(id=pid, userId=u['sub']).first()
    if not p:
        raise HTTPException(status_code=404, detail='not found')
    if (p.status.value if hasattr(p.status, 'value') else p.status) != models.ProposalStatus.DRAFT:
        raise HTTPException(status_code=400, detail='already sent')
    # Placeholder: submit to Upwork here if needed
    p.status = models.ProposalStatus.SENT
    p.sentAt = datetime.utcnow()
    db.commit()
    return { 'ok': True }


@app.get('/metrics/summary')
def metrics_summary(range: str = '30d', u=Depends(get_user), db: Session = Depends(get_db)):
    # simple counts for last N days
    try:
        days = int(range[:-1]) if range.endswith('d') else 30
    except Exception:
        days = 30
    since = datetime.utcnow().timestamp() - days * 86400
    rows = db.query(models.Proposal).filter_by(userId=u['sub']).all()
    daily = []
    counts = defaultdict(int)
    for r in rows:
        if not r.createdAt:
            continue
        if r.createdAt.timestamp() < since:
            continue
        d = r.createdAt.date().isoformat()
        counts[d] += 1
    for d, c in sorted(counts.items()):
        daily.append({'date': d, 'sent': c})
    return { 'range': range, 'daily': daily }


class ManualDraftBody(BaseModel):
    job: dict
    alias: str | None = None


@app.post('/proposals/manual')
def proposals_manual(body: ManualDraftBody, u=Depends(get_user), db: Session = Depends(get_db)):
    # choose api key
    q = db.query(models.ApiKey).filter_by(userId=u['sub'])
    if body.alias:
        q = q.filter_by(alias=body.alias)
    key = q.order_by(models.ApiKey.createdAt.desc()).first()
    if not key:
        raise HTTPException(status_code=400, detail='no api key')
    # generate draft
    try:
        from .openai_client import generate_draft
        draft = generate_draft('profile', body.job, [])
    except Exception as e:
        raise HTTPException(status_code=502, detail=f'openai error: {e}')
    # save proposal
    p = models.Proposal(
        userId=u['sub'],
        apiKeyId=key.id,
        jobId=str(body.job.get('id')),
        jobTitle=body.job.get('title'),
        draft=draft,
        status=models.ProposalStatus.DRAFT,
    )
    db.add(p)
    db.commit()
    db.refresh(p)
    return { 'id': p.id }

@app.get('/metrics/series')
def metrics_series(kind: str, range: str = '30d', u=Depends(get_user), db: Session = Depends(get_db)):
    if kind not in ('sent','replies','wins'):
        return []
    try:
        days = int(range[:-1]) if range.endswith('d') else 30
    except Exception:
        days = 30
    since = datetime.utcnow().timestamp() - days * 86400
    data = {}
    if kind == 'sent':
        rows = db.query(models.Proposal).filter_by(userId=u['sub']).all()
        for r in rows:
            if not r.sentAt:
                continue
            if r.sentAt.timestamp() < since:
                continue
            d = r.sentAt.date().isoformat()
            data[d] = data.get(d, 0) + 1
    elif kind == 'wins':
        rows = db.query(models.Proposal).filter_by(userId=u['sub']).all()
        for r in rows:
            if getattr(r, 'feedback', None) and getattr(r.feedback, 'value', getattr(r, 'feedback')) == 'UP':
                if not r.createdAt:
                    continue
                if r.createdAt.timestamp() < since:
                    continue
                d = r.createdAt.date().isoformat()
                data[d] = data.get(d, 0) + 1
    else:
        data = {}
    return [{ 'date': d, 'value': v } for d, v in sorted(data.items())]


@app.get('/upwork/jobs')
def upwork_jobs(query: str | None = None, alias: str | None = None, u=Depends(get_user), db: Session = Depends(get_db)):
    q = db.query(models.ApiKey).filter_by(userId=u['sub'])
    if alias:
        q = q.filter_by(alias=alias)
    key = q.order_by(models.ApiKey.createdAt.desc()).first()
    if not key:
        raise HTTPException(status_code=400, detail='no api key')
    if os.getenv('UPWORK_MOCK'):
        return [ { 'id': 'mock-1', 'title': f'Mock job {query or ""}'.strip() } ]
    gql = '{ JobSearch { id title } }'
    try:
        r = requests.post('https://www.upwork.com/api/graphql', json={'query': gql}, headers={ 'Authorization': f'Bearer {key.upworkKey}' })
        r.raise_for_status()
        data = r.json()
        return data.get('data', {}).get('JobSearch', [])
    except Exception as e:
        raise HTTPException(status_code=502, detail=f'upwork error: {e}')


# Rulesets CRUD (current user)
class RuleSetBody(BaseModel):
    name: str
    jsonLogic: str


@app.get('/rulesets')
def list_rulesets(u=Depends(get_user), db: Session = Depends(get_db)):
    rows = db.query(models.RuleSet).filter_by(userId=u['sub']).order_by(models.RuleSet.createdAt.desc()).all()
    return [ { 'id': r.id, 'name': r.name, 'jsonLogic': r.jsonLogic } for r in rows ]


@app.post('/rulesets')
def create_ruleset(body: RuleSetBody, u=Depends(get_user), db: Session = Depends(get_db)):
    # naive validation: must be valid JSON object
    try:
        obj = json.loads(body.jsonLogic)
        if not isinstance(obj, dict):
            raise ValueError('jsonLogic must be object')
    except Exception as e:
        raise HTTPException(status_code=400, detail=f'invalid jsonLogic: {e}')
    r = models.RuleSet(userId=u['sub'], name=body.name, jsonLogic=body.jsonLogic)
    db.add(r)
    db.commit()
    db.refresh(r)
    return { 'id': r.id }


@app.put('/rulesets/{rid}')
def update_ruleset(rid: str, body: RuleSetBody, u=Depends(get_user), db: Session = Depends(get_db)):
    r = db.query(models.RuleSet).filter_by(id=rid, userId=u['sub']).first()
    if not r:
        raise HTTPException(status_code=404, detail='not found')
    try:
        obj = json.loads(body.jsonLogic)
        if not isinstance(obj, dict):
            raise ValueError('jsonLogic must be object')
    except Exception as e:
        raise HTTPException(status_code=400, detail=f'invalid jsonLogic: {e}')
    r.name = body.name
    r.jsonLogic = body.jsonLogic
    db.commit()
    return { 'ok': True }


@app.delete('/rulesets/{rid}')
def delete_ruleset(rid: str, u=Depends(get_user), db: Session = Depends(get_db)):
    r = db.query(models.RuleSet).filter_by(id=rid, userId=u['sub']).first()
    if not r:
        raise HTTPException(status_code=404, detail='not found')
    db.delete(r)
    db.commit()
    return { 'ok': True }


# Stripe (stub)
@app.post('/stripe/checkout-session')
def stripe_checkout(req: Request, u=Depends(get_user)):
    origin = req.headers.get('origin') or 'http://localhost:3000'
    secret = os.getenv('STRIPE_SECRET_KEY')
    price = os.getenv('PRICE_ID', 'MONTHLY_49')
    if not secret:
        return { 'url': f'{origin}/dashboard/overview' }
    stripe.api_key = secret
    session = stripe.checkout.Session.create(
        mode='subscription',
        line_items=[{ 'price': price, 'quantity': 1 }],
        success_url=f'{origin}/dashboard/overview',
        cancel_url=f'{origin}/dashboard/overview',
        subscription_data={ 'metadata': { 'userId': u['sub'] } },
        customer_email=u.get('email'),
    )
    return { 'url': session.url }


@app.post('/stripe/webhook')
async def stripe_webhook(req: Request, db: Session = Depends(get_db)):
    payload = await req.body()
    sig = req.headers.get('stripe-signature')
    secret = os.getenv('STRIPE_WEBHOOK_SECRET')
    if not secret:
        return { 'received': True }
    try:
        event = stripe.Webhook.construct_event(payload, sig, secret)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f'Webhook Error: {e}')

    et = event['type']
    obj = event['data']['object']
    if et in ('invoice.payment_succeeded', 'invoice.paid'):
        user_id = obj.get('metadata', {}).get('userId') if isinstance(obj.get('metadata'), dict) else None
        if user_id:
            db.query(models.User).filter_by(id=user_id).update({ 'subscription': models.SubscriptionStatus.ACTIVE })
            db.commit()
    elif et == 'invoice.payment_failed':
        user_id = obj.get('metadata', {}).get('userId') if isinstance(obj.get('metadata'), dict) else None
        if user_id:
            db.query(models.User).filter_by(id=user_id).update({ 'subscription': models.SubscriptionStatus.PAST_DUE })
            db.commit()
    return { 'received': True }


@app.get('/conversations')
def conversations(since: str = '7d', u=Depends(get_user)):
    # Stub for UI; real implementation would query conversation table
    return []
