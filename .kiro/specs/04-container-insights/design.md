# Container Insights — Design

## Architecture

```
EKS Cluster
├── Namespace: amazon-cloudwatch
│   ├── DaemonSet: cloudwatch-agent
│   │   ├── Collects container metrics
│   │   └── Sends to CloudWatch Metrics
│   └── DaemonSet: fluent-bit
│       ├── Collects container logs
│       └── Sends to CloudWatch Logs
├── IAM (IRSA)
│   ├── Role: cloudwatch-agent-role
│   │   └── Policy: CloudWatchAgentServerPolicy
│   └── Role: fluent-bit-role
│       └── Policy: CloudWatchLogsFullAccess (scoped)
└── CloudWatch
    ├── Log Group: /aws/containerinsights/<cluster>/application
    ├── Log Group: /aws/containerinsights/<cluster>/host
    └── Log Group: /aws/containerinsights/<cluster>/dataplane
```

## CDK Constructs Used
- `eks.HelmChart` or `eks.KubernetesManifest` — deploy agents
- `iam.Role` with OIDC provider — IRSA roles
- `logs.LogGroup` — log groups with retention

## Deployment Method
Option A: Helm charts (recommended — `amazon-cloudwatch-observability`)
Option B: Raw Kubernetes manifests via `eks.KubernetesManifest`

## Design Decisions
- IRSA over node-level IAM for least-privilege
- 7-day log retention to control costs during workshop
- Fluent Bit over Fluentd for lower resource footprint
