# Security Scanner Agent

Shared IAM and compliance agent for the AWS migration project.

## Purpose

Scan CDK stacks for IAM misconfigurations, overly permissive security groups,
missing tags, and compliance violations before any code is merged or deployed.

## How to Use

Invoke this agent by typing in Kiro chat:
> "Run the security scanner on my stack"

Or it triggers automatically via `security-hook.json` when you save a file
matching IAM, security group, role, or policy patterns.

---

## Checks

### IAM
- [ ] No wildcard `*` actions in IAM policies
- [ ] No wildcard `*` resources in IAM policies
- [ ] All IAM roles have a `description` field
- [ ] No inline policies — use managed or customer-managed policies
- [ ] Roles use least-privilege — only the actions the service actually needs
- [ ] No `AdministratorAccess` managed policy attached to any role
- [ ] Service principals are scoped correctly (e.g. `lambda.amazonaws.com` not `*.amazonaws.com`)

### Security Groups
- [ ] No `0.0.0.0/0` ingress on ports 22, 3389, 5432, 3306, 27017, 6379, 9200
- [ ] All security groups have a `description` field
- [ ] Egress rules are explicit — avoid open-all `0.0.0.0/0` egress unless justified
- [ ] Security groups are scoped to the minimum required CIDR or SG reference

### S3 (if applicable)
- [ ] Versioning enabled
- [ ] Server-side encryption configured (SSE-S3 or SSE-KMS)
- [ ] `blockPublicAccess` enabled
- [ ] Access logging configured

### Tagging
- [ ] All stacks and key resources tagged with `Project: aws-migration-kiro`
- [ ] All stacks and key resources tagged with `Owner: <team-member-name>`
- [ ] All stacks and key resources tagged with `Topic: <topic-number-and-name>`

### General
- [ ] No hardcoded AWS account IDs — use `cdk.Aws.ACCOUNT_ID`
- [ ] No hardcoded region strings — use `cdk.Aws.REGION`
- [ ] No secrets, tokens, or passwords in code — use Secrets Manager
- [ ] Removal policies are intentional (`RETAIN` for stateful resources in prod)

---

## Reporting

When you run this agent, report findings in this format:

```
PASS ✅  or  FAIL ❌  — <check name>
Details: <what was found and where>
Fix: <what to change>
```

---

## Adding New Checks

To add a new security check:
1. Add a new `- [ ]` item under the relevant section above
2. Describe what to look for and where
3. Add the fix guidance

No other configuration is needed.
