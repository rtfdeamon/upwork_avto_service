import os
import time
from typing import List
from openai import OpenAI
import redis


class OpenAITransient(Exception):
    pass


_client = None
_redis = None


def _get_client():
    global _client
    if _client is None:
        api_key = os.getenv('OPENAI_API_KEY')
        if not api_key:
            raise RuntimeError('OPENAI_API_KEY missing')
        _client = OpenAI(api_key=api_key, organization=os.getenv('OPENAI_ORG_ID'))
    return _client


def _get_redis():
    global _redis
    if _redis is None and os.getenv('REDIS_URL'):
        _redis = redis.from_url(os.getenv('REDIS_URL'))
    return _redis


def _check_rate(tokens: int):
    r = _get_redis()
    if not r:
        return
    limit = int(os.getenv('OPENAI_TPM', '200000'))
    key = 'openai:tpm'
    v = r.incrby(key, tokens)
    if v == tokens:
        r.expire(key, 60)
    if v > limit:
        raise OpenAITransient('rate')


def generate_draft(profile: str, job_json: dict, cases: List[str]) -> str:
    prompt = f"""
You are an elite Upwork sales rep. Draft a concise, personalized cover letter.
Job: {job_json}
Profile: {profile}
Cases: {cases}
Return a short letter with a clear CTA.
""".strip()
    primary = os.getenv('OPENAI_MODEL_PRIMARY', 'gpt-4o')
    fallbacks = [m for m in os.getenv('OPENAI_MODEL_FALLBACK', 'gpt-4o-mini,gpt-3.5-turbo-0125').split(',') if m]
    models = [primary] + fallbacks

    for m in models:
        try:
            _check_rate(2000)
            client = _get_client()
            resp = client.chat.completions.create(
                model=m,
                messages=[{"role": "user", "content": prompt}],
                max_tokens=200,
            )
            return resp.choices[0].message.content or ""
        except Exception as e:
            time.sleep(0.5)
            continue
    raise OpenAITransient('all models failed')

