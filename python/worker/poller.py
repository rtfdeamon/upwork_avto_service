import os
import time
import requests
from python.api.db import SessionLocal
from python.api import models


def search_jobs(token: str):
    if os.getenv('UPWORK_MOCK'):
        return [ { 'id': 'mock-job-1', 'title': 'Mock job' } ]
    gql = '{ JobSearch { id title } }'
    try:
        r = requests.post('https://www.upwork.com/api/graphql', json={'query': gql}, headers={ 'Authorization': f'Bearer {token}' })
        r.raise_for_status()
        return r.json().get('data', {}).get('JobSearch', [])
    except Exception:
        return []


def run_once():
    db = SessionLocal()
    try:
        keys = db.query(models.ApiKey).all()
        for key in keys:
            jobs = search_jobs(key.upworkKey)
            # here we would push to SQS; for now, just print
            if jobs:
                print('jobs for', key.id, ':', len(jobs))
    finally:
        db.close()


def main_loop():
    while True:
        run_once()
        time.sleep(60)


if __name__ == '__main__':
    main_loop()

