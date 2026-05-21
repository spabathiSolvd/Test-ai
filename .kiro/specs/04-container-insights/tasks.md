# Container Insights — Tasks

## Implementation Tasks

- [ ] Create `ContainerInsightsStack` class extending `cdk.Stack`
- [ ] Import EKS cluster from EksMigrationStack output
- [ ] Create IRSA role for CloudWatch agent
- [ ] Create IRSA role for Fluent Bit
- [ ] Create CloudWatch log groups with 7-day retention
- [ ] Deploy CloudWatch agent (Helm or manifest)
- [ ] Deploy Fluent Bit (Helm or manifest)
- [ ] Add required tags (Project, Owner, Topic)
- [ ] Write snapshot test
- [ ] Verify `cdk synth ContainerInsightsStack` passes
- [ ] Deploy and validate metrics appear in CloudWatch console
