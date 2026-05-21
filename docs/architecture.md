# Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        AWS Account                          │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Foundation (shared)                                 │   │
│  │                                                      │   │
│  │  ┌─────────────────┐   ┌──────────────────────────┐  │   │
│  │  │  SecurityStack  │   │      NetworkingStack      │  │   │
│  │  │  - IAM Roles    │   │  - VPC (3 AZs)           │  │   │
│  │  │  - SGs / NACLs  │   │  - Public / Private /    │  │   │
│  │  └─────────────────┘   │    Isolated subnets      │  │   │
│  │                        │  - NAT Gateway           │  │   │
│  │  ┌─────────────────┐   │  - VPC Flow Logs         │  │   │
│  │  │  EksBaseStack   │   └──────────────────────────┘  │   │
│  │  │  - EKS Cluster  │                                  │   │
│  │  │    v1.29        │                                  │   │
│  │  └─────────────────┘                                  │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Topics (per team member)                            │   │
│  │                                                      │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌───────────┐  │   │
│  │  │ EksMigration │  │  CloudWatch  │  │ Container │  │   │
│  │  │   (Harish)   │  │  Dashboards  │  │ Insights  │  │   │
│  │  │              │  │  (Sridhar)   │  │  (Ronak)  │  │   │
│  │  └──────────────┘  └──────────────┘  └───────────┘  │   │
│  │                                                      │   │
│  │  ┌──────────────┐                                    │   │
│  │  │  Kafka / MSK │                                    │   │
│  │  │  (Francisco) │                                    │   │
│  │  └──────────────┘                                    │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Stack Dependencies

```
SecurityStack ──┐
                ├──► EksBaseStack ──► EksMigrationStack
NetworkingStack ┘                └──► ContainerInsightsStack
     │
     └──► KafkaMskStack
```

## Key Design Decisions

- Foundation stacks are deployed first and export values via `CfnOutput`
- Topic stacks import foundation resources — no direct object references across stack boundaries in production
- Each team member owns exactly one topic stack and its CI workflow
- All resources share common tags for cost allocation and ownership tracking
