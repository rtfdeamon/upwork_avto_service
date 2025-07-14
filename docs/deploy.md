# Production deployment

This project uses Terragrunt to manage infrastructure.

```bash
cd infra/terragrunt
terragrunt run-all apply
```

After Terragrunt finishes, execute the post-deploy script to create the EventBridge rule and SQS dead letter queue:

```bash
./scripts/post_deploy.sh
```

The modules provision the VPC, RDS instance, Lambda functions, the Fargate poller service, an ALB for the API and an S3 bucket for static assets.
