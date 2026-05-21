# Kiro Shared Context

This file provides shared context for all topics in the AWS migration project.

## Project Structure

- `lib/foundation/` — shared infrastructure everyone depends on (IAM, SGs, EKS base)
- `lib/topics/` — individual team topic stacks
- `bin/app.ts` — CDK entry point that imports all stacks
- `docs/` — architecture diagrams, findings, and onboarding

## Coding Standards

- All CDK stacks must extend `cdk.Stack`
- Use descriptive construct IDs
- Tag all resources with `Project`, `Owner`, and `Topic` tags
- No hardcoded account IDs or region strings — use `cdk.Aws.ACCOUNT_ID` / `cdk.Aws.REGION`
- IAM roles follow least-privilege principle

## CDK Conventions

- Stack outputs should be exported for cross-stack references
- Use `cdk.CfnOutput` for values other stacks or CI need
- Prefer L2 constructs over L1 (Cfn*) where available

## Security

- All S3 buckets must have versioning and encryption enabled
- Security groups should restrict ingress to known CIDRs only
- Secrets go in AWS Secrets Manager — never in code or environment variables
