# Kafka / MSK — Requirements

Owner: Francisco Moreno

## Objective
Deploy an Amazon MSK (Managed Streaming for Apache Kafka) cluster
for event streaming between microservices in the migration environment.

## Functional Requirements
- [ ] MSK cluster with 3 brokers (one per AZ)
- [ ] Kafka version 3.5.x or later
- [ ] IAM authentication enabled
- [ ] TLS encryption in-transit
- [ ] At-rest encryption with AWS-managed KMS key
- [ ] Security group restricting access to private subnets only
- [ ] CloudWatch monitoring (basic or enhanced)

## Non-Functional Requirements
- [ ] Broker instance type: kafka.m5.large
- [ ] Storage: 100 GiB per broker (auto-scaling enabled)
- [ ] All resources tagged with Project, Owner, Topic
- [ ] Bootstrap broker endpoints exported via CfnOutput

## Dependencies
- NetworkingStack (vpc, private subnets)

## Outputs Consumed By
- Application workloads running on EKS (consume/produce to topics)
