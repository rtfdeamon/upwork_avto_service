import os
from sqlalchemy.orm import Session
from python.api.db import SessionLocal
from python.api import models
from python.api.openai_client import generate_draft


def handle_message(payload: dict):
    db: Session = SessionLocal()
    try:
        key = db.query(models.ApiKey).filter_by(id=payload['apiKeyId']).first()
        if not key:
            return
        user = db.query(models.User).filter_by(id=key.userId).first()
        if not user or user.subscription != models.SubscriptionStatus.ACTIVE:
            return
        draft = generate_draft('profile', payload['jobJson'], [])
        p = models.Proposal(
            userId=user.id,
            apiKeyId=key.id,
            jobId=payload['jobJson']['id'],
            jobTitle=payload['jobJson'].get('title'),
            draft=draft,
            status=models.ProposalStatus.DRAFT,
        )
        db.add(p)
        db.commit()
    finally:
        db.close()
