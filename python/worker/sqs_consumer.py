import os
import json
import time
import boto3
from .draft_handler import handle_message


def ensure_queue(sqs):
    url = os.getenv('JOBS_QUEUE_URL')
    if url:
        return url
    name = os.getenv('JOBS_QUEUE', 'jobs.fifo')
    # Ensure FIFO suffix
    if not name.endswith('.fifo'):
        name = name + '.fifo'
    attrs = {
        'FifoQueue': 'true',
        'ContentBasedDeduplication': 'true'
    }
    resp = sqs.create_queue(QueueName=name, Attributes=attrs)
    return resp['QueueUrl']


def main():
    sqs = boto3.client('sqs', region_name=os.getenv('AWS_REGION', 'us-east-1'), endpoint_url=os.getenv('AWS_ENDPOINT_URL'))
    url = ensure_queue(sqs)
    while True:
        resp = sqs.receive_message(QueueUrl=url, MaxNumberOfMessages=5, WaitTimeSeconds=10)
        msgs = resp.get('Messages', [])
        for m in msgs:
            try:
                payload = json.loads(m['Body'])
                handle_message(payload)
            finally:
                sqs.delete_message(QueueUrl=url, ReceiptHandle=m['ReceiptHandle'])
        if not msgs:
            time.sleep(1)


if __name__ == '__main__':
    main()
