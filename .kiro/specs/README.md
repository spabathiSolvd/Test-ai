# Specs

Spec definitions for each topic in the migration project. Each topic has its own
folder with three files:

```
.kiro/specs/<topic>/
├── requirements.md   — what needs to be built (functional + non-functional)
├── design.md         — how it will be built (architecture, constructs, decisions)
└── tasks.md          — implementation checklist (ordered steps)
```

## Current Specs

| Folder | Topic | Owner |
|--------|-------|-------|
| `01-networking/` | VPC, subnets, NAT, endpoints | Emmanuel |
| `02-eks-migration/` | EKS cluster, node groups, add-ons | Harish Ramineni |
| `03-cloudwatch-dashboards/` | Dashboards, alarms, SNS | Sridhar |
| `04-container-insights/` | CW agent, Fluent Bit, IRSA | Ronak |
| `05-kafka-msk/` | MSK cluster, IAM auth, encryption | Francisco Moreno |

## Adding a New Spec

1. Create a new folder: `.kiro/specs/<topic-name>/`
2. Add three files: `requirements.md`, `design.md`, `tasks.md`
3. Follow the same structure as existing specs
4. Reference the spec in Kiro chat: `#[[file:.kiro/specs/<topic>/requirements.md]]`

## Using Specs with Kiro

You can reference spec files in Kiro chat to guide implementation:
- "Implement the tasks in #[[file:.kiro/specs/01-networking/tasks.md]]"
- "Review my code against #[[file:.kiro/specs/02-eks-migration/requirements.md]]"
- "Does my stack match the design in #[[file:.kiro/specs/05-kafka-msk/design.md]]?"

Kiro will read the spec and use it as context for code generation and review.
