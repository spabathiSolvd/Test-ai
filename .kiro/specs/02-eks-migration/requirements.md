# EKS Migration — Requirements

Owner: Harish Ramineni

## Objective
Set up an EKS cluster with managed node groups, configure add-ons,
and prepare for workload migration from existing infrastructure.

## Functional Requirements
- [ ] EKS cluster (Kubernetes v1.29+)
- [ ] Managed node group with auto-scaling (min 2, max 5 nodes)
- [ ] Node instance type: m5.large or equivalent
- [ ] CoreDNS, kube-proxy, and VPC-CNI add-ons
- [ ] OIDC provider for IAM Roles for Service Accounts (IRSA)
- [ ] Cluster admin IAM role
- [ ] kubectl access configured via aws-auth ConfigMap

## Non-Functional Requirements
- [ ] Cluster endpoint: public + private access
- [ ] Logging enabled: api, audit, authenticator
- [ ] All resources tagged with Project, Owner, Topic
- [ ] Cluster name and ARN exported via CfnOutput

## Dependencies
- NetworkingStack (vpc)
- SecurityStack (node IAM role)

## Outputs Consumed By
- ContainerInsightsStack (cluster)
