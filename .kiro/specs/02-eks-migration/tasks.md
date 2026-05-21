# EKS Migration — Tasks

## Implementation Tasks

- [ ] Create `EksMigrationStack` class extending `cdk.Stack`
- [ ] Import VPC from NetworkingStack output
- [ ] Create EKS cluster with v1.29
- [ ] Configure managed node group (m5.large, 2-5 nodes)
- [ ] Enable cluster logging (api, audit, authenticator)
- [ ] Set up OIDC provider for IRSA
- [ ] Create cluster admin role
- [ ] Install add-ons (CoreDNS, kube-proxy, VPC-CNI)
- [ ] Add required tags (Project, Owner, Topic)
- [ ] Export cluster name, ARN, endpoint via CfnOutput
- [ ] Write snapshot test
- [ ] Verify `cdk synth EksMigrationStack` passes
- [ ] Deploy and validate kubectl access
