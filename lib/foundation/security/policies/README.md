# Sample IAM Policies

This folder contains least-privilege IAM policy templates for common use cases
in this project. Use these as starting points in your CDK stacks.

## Available Policies

| File | Use Case |
|------|----------|
| `eks-node-policy.json` | EKS worker node permissions (EC2, ECR, CloudWatch) |
| `container-insights-agent-policy.json` | IRSA policy for CloudWatch Container Insights agent |
| `msk-producer-consumer-policy.json` | IRSA policy for apps producing/consuming from MSK |

## How to Use in CDK

```typescript
import * as iam from 'aws-cdk-lib/aws-iam';
import * as fs from 'fs';
import * as path from 'path';

// Load the policy document
const policyDoc = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../../foundation/security/policies/eks-node-policy.json'), 'utf-8')
);

// Create a managed policy from it
const policy = new iam.ManagedPolicy(this, 'EksNodePolicy', {
  document: iam.PolicyDocument.fromJson(policyDoc),
  description: 'Least-privilege policy for EKS worker nodes',
});
```

## Adding New Policies

1. Create a new `.json` file in this folder
2. Include a `_description` field at the top explaining the policy's purpose
3. Follow least-privilege: only the actions the service actually needs
4. Use resource ARN patterns instead of `"*"` where possible
5. Update this README with the new file

No other configuration is needed — just drop the file here.
