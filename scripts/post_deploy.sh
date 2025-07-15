#!/bin/bash
# create periodic rule and DLQ after infra deployment
set -euo pipefail
aws events put-rule --name poll-upwork-jobs --schedule-expression "rate(1 minute)"
aws sqs create-queue --queue-name jobs-dlq.fifo --attributes FifoQueue=true,ContentBasedDeduplication=true
