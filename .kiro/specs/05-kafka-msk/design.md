# Kafka / MSK — Design

## Architecture

```
VPC (Private Subnets)
├── MSK Cluster
│   ├── Broker 1 (AZ-a, kafka.m5.large, 100 GiB)
│   ├── Broker 2 (AZ-b, kafka.m5.large, 100 GiB)
│   └── Broker 3 (AZ-c, kafka.m5.large, 100 GiB)
├── Security Group
│   ├── Ingress: port 9098 (IAM auth) from VPC CIDR
│   └── Ingress: port 9094 (TLS) from VPC CIDR
├── Authentication: IAM
├── Encryption
│   ├── In-transit: TLS
│   └── At-rest: AWS-managed KMS
└── Monitoring
    └── CloudWatch (DEFAULT or PER_BROKER)
```

## CDK Constructs Used
- `msk.CfnCluster` — L1 construct (MSK L2 is limited)
- `ec2.SecurityGroup` — broker security group
- `ec2.Vpc.fromLookup` or imported VPC — network placement

## Outputs
- `MskClusterArn` — cluster ARN
- `MskBootstrapBrokers` — bootstrap broker connection string

## Design Decisions
- IAM auth over SASL/SCRAM for simpler credential management
- L1 CfnCluster because L2 `msk.Cluster` doesn't support all config options
- 3 brokers (one per AZ) for high availability
- Storage auto-scaling to avoid manual intervention
