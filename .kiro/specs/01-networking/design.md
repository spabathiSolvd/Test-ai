# Networking — Design

## Architecture

```
VPC (10.0.0.0/16)
├── Public Subnets (10.0.0.0/24, 10.0.1.0/24, 10.0.2.0/24)
│   └── Internet Gateway
├── Private Subnets (10.0.10.0/24, 10.0.11.0/24, 10.0.12.0/24)
│   └── NAT Gateway (single, in AZ-a)
└── Isolated Subnets (10.0.20.0/28, 10.0.20.16/28, 10.0.20.32/28)
    └── No internet access
```

## CDK Constructs Used
- `ec2.Vpc` — L2 construct with subnet configuration
- `ec2.FlowLog` — VPC flow logs to CloudWatch
- `ec2.GatewayVpcEndpoint` — S3 and DynamoDB endpoints

## Outputs
- `MigrationVpcId` — VPC ID for cross-stack references

## Design Decisions
- Single NAT gateway to reduce cost during workshop
- /28 for isolated subnets since they only hold a few RDS/ElastiCache instances
- VPC endpoints avoid NAT charges for S3/DynamoDB traffic
