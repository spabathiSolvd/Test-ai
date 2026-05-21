# EKS Migration — Design

## Architecture

```
EKS Cluster (v1.29)
├── Control Plane (AWS managed)
│   ├── Public endpoint (restricted CIDR)
│   └── Private endpoint (VPC internal)
├── Managed Node Group
│   ├── m5.large instances
│   ├── Min: 2, Max: 5, Desired: 2
│   └── Private subnets only
└── Add-ons
    ├── CoreDNS
    ├── kube-proxy
    └── VPC-CNI
```

## CDK Constructs Used
- `eks.Cluster` — L2 construct for EKS cluster
- `eks.NodegroupOptions` — managed node group config
- `iam.Role` — cluster admin and node roles
- `eks.KubernetesVersion` — version pinning

## Outputs
- `EksClusterName` — cluster name
- `EksClusterArn` — cluster ARN
- `EksClusterEndpoint` — API server endpoint

## Design Decisions
- Public + private endpoint for workshop convenience (restrict in prod)
- Single node group to start — can add spot/GPU groups later
- IRSA enabled from day one for pod-level IAM
