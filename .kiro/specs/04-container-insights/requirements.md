# Container Insights — Requirements

Owner: Ronak

## Objective
Deploy CloudWatch Container Insights on the EKS cluster to collect
container-level metrics, logs, and traces for observability.

## Functional Requirements
- [ ] CloudWatch agent deployed as DaemonSet on EKS
- [ ] Fluent Bit deployed as DaemonSet for log forwarding
- [ ] Container-level metrics: CPU, memory, network, disk per pod
- [ ] Cluster-level metrics: node count, pod density, resource utilization
- [ ] Logs forwarded to CloudWatch Logs with structured format
- [ ] Log group with defined retention period (7 days for workshop)

## Non-Functional Requirements
- [ ] Agent resource limits: 200m CPU, 200Mi memory
- [ ] Log group retention: 7 days
- [ ] All resources tagged with Project, Owner, Topic
- [ ] IRSA used for agent IAM permissions (no node-level permissions)

## Dependencies
- EksMigrationStack (cluster)

## Outputs Consumed By
- CloudWatchDashboardsStack (metrics feed into dashboards)
