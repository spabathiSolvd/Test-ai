# Networking — Requirements

Owner: Emmanuel

## Objective
Create a production-ready VPC with public, private, and isolated subnets
across multiple availability zones to support EKS, MSK, and other services.

## Functional Requirements
- [ ] VPC with CIDR block (non-overlapping with other team members)
- [ ] 3 AZs minimum
- [ ] Public subnets with internet gateway
- [ ] Private subnets with NAT gateway (egress-only)
- [ ] Isolated subnets (no internet access — for databases)
- [ ] VPC Flow Logs enabled (all traffic)
- [ ] VPC endpoints for S3 and DynamoDB (gateway type)
- [ ] DNS hostnames and DNS resolution enabled

## Non-Functional Requirements
- [ ] NAT gateway count: 1 for cost savings (can scale to per-AZ later)
- [ ] Subnet CIDR masks: /24 for public/private, /28 for isolated
- [ ] All resources tagged with Project, Owner, Topic
- [ ] VPC ID exported via CfnOutput for other stacks to consume

## Dependencies
- None — this is a foundation stack

## Outputs Consumed By
- EksBaseStack (vpc)
- EksMigrationStack (vpc)
- KafkaMskStack (vpc)
