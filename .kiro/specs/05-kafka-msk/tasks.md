# Kafka / MSK — Tasks

## Implementation Tasks

- [ ] Create `KafkaMskStack` class extending `cdk.Stack`
- [ ] Import VPC from NetworkingStack output
- [ ] Create security group for MSK brokers
- [ ] Configure MSK cluster (3 brokers, kafka.m5.large)
- [ ] Enable IAM authentication
- [ ] Enable TLS encryption in-transit
- [ ] Enable at-rest encryption (AWS-managed KMS)
- [ ] Configure storage (100 GiB, auto-scaling)
- [ ] Enable CloudWatch monitoring
- [ ] Add required tags (Project, Owner, Topic)
- [ ] Export cluster ARN and bootstrap brokers via CfnOutput
- [ ] Write snapshot test
- [ ] Verify `cdk synth KafkaMskStack` passes
- [ ] Deploy and validate broker connectivity
