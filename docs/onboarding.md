# Team Onboarding Guide

---

## 1. What This Repo Is For

This repo holds the CDK infrastructure code for the AWS migration workshop. Each team member owns one topic stack and works on it independently in their **own AWS account**.

**The repo is for code — not shared infrastructure.**

- You write and test your CDK stack here
- The CI pipeline validates your code (build, test, synth) automatically
- You run `cdk deploy` manually from your own machine against your own AWS account
- There is no shared deployment pipeline — each person deploys to their own account

---

## 2. Required Versions

Everyone must use these exact versions. The `package-lock.json` is committed to enforce this.

| Tool | Version |
|------|---------|
| Node.js | `20.x` |
| npm | `>=10` |
| `aws-cdk-lib` | `2.256.0` |
| `aws-cdk` (CLI) | `2.1124.0` |
| `constructs` | `10.6.0` |
| `typescript` | `5.9.3` |
| `ts-node` | `10.9.2` |
| `jest` | `29.7.0` |
| `ts-jest` | `29.4.10` |

If you have nvm installed, run `nvm use` in the project root — the `.nvmrc` file will switch you to Node 20 automatically.

**Always run `npm ci`, not `npm install`.** `npm ci` installs exactly what is in `package-lock.json`. `npm install` can silently upgrade packages and cause version drift.

---

## 3. First-Time Setup

```bash
# 1. Clone the repo
git clone https://github.com/solvdinc/agentic-sdlc-pilot.git
cd agentic-sdlc-pilot/aws-migration-kiro

# 2. Switch to the correct Node version (requires nvm)
nvm use

# 3. Install exact dependencies
npm ci

# 4. Configure your AWS credentials
aws configure
# or if using SSO:
aws sso login --profile <your-profile>

# 5. Bootstrap CDK in your account (one-time only)
npx cdk bootstrap

# 6. Verify everything works
npm run build
npx cdk synth
```

---

## 4. Branching Strategy

### Rules
- **Never push directly to `main`**
- All work goes on a feature branch
- The only way code gets into `main` is through the automated pipeline

### Branch naming
```
feature/<your-topic>
feat/<your-topic>
```

Examples:
```
feature/networking
feature/eks-migration
feature/cloudwatch-dashboards
feature/container-insights
feature/kafka-msk
```

### Workflow
```
1. Create your feature branch
   git checkout -b feature/your-topic

2. Write your CDK stack code

3. Build and test locally before pushing
   npm run build
   npm test
   npx cdk synth <YourStackName>

4. Push your branch
   git push -u origin feature/your-topic

5. The CI pipeline runs automatically (see Section 5)

6. If the pipeline passes → your branch is auto-merged to main
   If the pipeline fails → fix the issue and push again
```

---

## 5. How the CI Pipeline Works

When you push to a `feature/**` or `feat/**` branch, the pipeline runs **4 jobs in sequence**. All must pass for your code to merge.

```
Job 1: scan-hardcoded-values
       ↓ (must pass)
Job 2: check-up-to-date
       ↓ (must pass)
Job 3: build-and-test
       ↓ (must pass)
Job 4: auto-merge → merges your branch into main
```

### Job 1 — Hardcoded value scan
Scans your `.ts` files for hardcoded AWS account IDs (12-digit numbers) and region strings (e.g. `"us-east-1"`).

**If it fails:** Replace hardcoded values with:
```typescript
cdk.Aws.ACCOUNT_ID   // instead of "123456789012"
cdk.Aws.REGION       // instead of "us-east-1"
// or
cdk.Stack.of(this).account
cdk.Stack.of(this).region
```

### Job 2 — Branch up-to-date check
Checks that your branch is not missing commits from `main`. If someone else merged to `main` after you branched, you need to rebase.

**If it fails:** You'll see the exact missing commits listed. Fix with:
```bash
git fetch origin
git rebase origin/main
# resolve any conflicts, then:
git push --force-with-lease origin feature/your-topic
```

### Job 3 — Build and test
Runs: `npm ci` → `npm run build` → `npm test` → `npx cdk synth`

**If it fails:** Fix the TypeScript errors or test failures locally, then push again.

### Job 4 — Auto-merge
If all three jobs pass, the pipeline automatically merges your branch into `main` with a `--no-ff` merge commit. You don't need to do anything.

---

## 6. Deploying to Your AWS Account

The CI pipeline only validates code — it never deploys. Deployment is manual, from your own machine, to your own AWS account.

### Deploy your stack
```bash
# Synth first to catch any issues
npx cdk synth <YourStackName>

# See what will change before deploying
npx cdk diff <YourStackName>

# Deploy
npx cdk deploy <YourStackName>
```

### Your stack name

| Topic | Stack name |
|-------|------------|
| Networking | `NetworkingStack` |
| EKS Migration | `EksMigrationStack` |
| CloudWatch Dashboards | `CloudWatchDashboardsStack` |
| Container Insights | `ContainerInsightsStack` |
| Kafka / MSK | `KafkaMskStack` |

### Deploy all stacks at once
```bash
npx cdk deploy --all
```

### Destroy your stack (cleanup)
```bash
npx cdk destroy <YourStackName>
```

### Important notes on deployment
- Your AWS credentials must be configured and have sufficient permissions
- Run `npx cdk bootstrap` once per account/region before your first deploy
- Never hardcode your account ID or region in stack code — use `cdk.Aws.ACCOUNT_ID` and `cdk.Aws.REGION`
- The CI pipeline will reject your code if it finds hardcoded values

---

## 7. Your Topic Stack

Each person owns one file:

| Owner | File | Stack |
|-------|------|-------|
| Emmanuel | `lib/topics/01-networking/networking-stack.ts` | `NetworkingStack` |
| Harish Ramineni | `lib/topics/02-eks-migration/eks-migration-stack.ts` | `EksMigrationStack` |
| Sridhar | `lib/topics/03-cloudwatch-dashboards/cloudwatch-dashboards-stack.ts` | `CloudWatchDashboardsStack` |
| Ronak | `lib/topics/04-container-insights/container-insights-stack.ts` | `ContainerInsightsStack` |
| Francisco Moreno | `lib/topics/05-kafka-msk/kafka-msk-stack.ts` | `KafkaMskStack` |

The files are currently empty — that's intentional. Start by adding your CDK stack class.

---

## 8. Useful Commands

```bash
nvm use                          # switch to correct Node version
npm ci                           # install exact dependencies
npm run build                    # compile TypeScript
npm test                         # run tests
npx cdk synth <StackName>        # synthesize your stack
npx cdk diff <StackName>         # diff against deployed state
npx cdk deploy <StackName>       # deploy to your AWS account
npx cdk destroy <StackName>      # tear down your stack
```

---

## 9. How to Leverage AI in This Exercise

This is not just an infrastructure exercise. The goal is to **build infrastructure using AI-assisted development** and document what worked, what didn't, and what you'd do differently.

### The AI tools available to you

| Tool | What it does | How to use it |
|------|--------------|---------------|
| **Kiro** (IDE) | Reads your workspace, generates code, runs commands, reviews changes | Chat in the IDE — it sees your files, specs, and git state |
| **Bedrock Claude** (API) | Same model, but you provide context manually | AWS Console or API — copy/paste your requirements |
| **Kiro Agents** | Automated checks on file save | Already configured — security scanner and code reviewer run automatically |
| **Kiro Specs** | Structured requirements → design → tasks | Tell Kiro: "Implement the tasks in `.kiro/specs/<your-topic>/tasks.md`" |

### What you should try with AI

**1. Generate your CDK stack from the spec**
```
"Read .kiro/specs/05-kafka-msk/requirements.md and implement the stack in
lib/topics/05-kafka-msk/kafka-msk-stack.ts"
```
See how much of the implementation AI gets right on the first pass.

**2. Debug with AI**
When `cdk synth` or `cdk deploy` fails, paste the error into Kiro or Bedrock and ask it to diagnose. Compare which tool gives you a faster fix.

**3. Write a custom agent for your topic**
Create `.kiro/agents/<your-topic>-advisor.md` with domain-specific knowledge:
- MSK: replication patterns, MirrorMaker vs MSK Replicator tradeoffs
- EKS: common deployment failures, node group sizing
- CloudWatch: metric math patterns, alarm threshold recommendations
- Container Insights: agent configuration, log parsing patterns
- Networking: CIDR planning, VPC peering vs Transit Gateway

**4. Write a custom hook for your topic**
Create `.kiro/hooks/<your-topic>-check.json` that triggers AI checks specific to your domain. Example: a hook that validates SSM parameter naming conventions when you create one.

**5. Compare Kiro vs Bedrock on the same task**
For at least one task, try it both ways:
- With Kiro (workspace-aware, can edit files directly)
- With Bedrock Claude (you provide context manually)

Document the comparison in `docs/kiro-vs-bedrock.md` under your section.

### What to document

By Thursday PM, each person should be able to answer:

1. **How did AI help?** — What tasks were faster with AI? Code generation, debugging, learning new CDK constructs?
2. **Where did AI fail?** — What did it get wrong? Did you have to correct IAM policies, fix resource configs, or rewrite generated code?
3. **What patterns work?** — Did spec-driven generation work better than freeform chat? Did providing examples help?
4. **Would you use this on a real project?** — For a real migration, would AI-assisted CDK development save time or create risk?

Record your findings in `docs/findings.md` and `docs/kiro-vs-bedrock.md`.

### The two-step exercise structure

**Step 1 — Explore and prove (your own account)**
Deploy your topic's infrastructure manually with AI assistance. Validate it works. This is your sandbox.

**Step 2 — Codify and share (this repo)**
Take what you proved and turn it into a reusable CDK module. Push it via a feature branch. The pipeline validates it. The team can learn from your code.

The infrastructure is the vehicle — the learning is about how AI changes the software development lifecycle.

---

## 10. Getting Help

- Architecture overview: `docs/architecture.md`
- Team findings (Thursday PM): `docs/findings.md`
- Kiro vs Bedrock comparison: `docs/kiro-vs-bedrock.md`
- Shared coding standards: `CLAUDE.md`
- Specs for your topic: `.kiro/specs/<your-topic>/`
- Sample IAM policies: `lib/foundation/security/policies/`
