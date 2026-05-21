# AWS Migration Kiro

Project overview and setup instructions for the AWS migration workshop....

## Team work

| Topic | Owner |
|-------|-------|
| Networking | Emmanuel |
| EKS Migration | Harish Ramineni |
| CloudWatch Dashboards | Sridhar |
| Container Insights | Ronak |
| Kafka / MSK | Francisco Moreno |

---

## Required Versions

Everyone must use these exact versions to avoid mismatches. The `package-lock.json` is committed to enforce this.

### Runtime

| Tool | Version | Notes |
|------|---------|-------|
| Node.js | `20.x` | Use `nvm use` — `.nvmrc` is set to `20` |
| npm | `>=10` | Comes with Node 20 |

### CDK

| Package | Version |
|---------|---------|
| `aws-cdk-lib` | `2.256.0` |
| `aws-cdk` (CLI) | `2.1124.0` |
| `constructs` | `10.6.0` |

### TypeScript

| Package | Version |
|---------|---------|
| `typescript` | `5.9.3` |
| `ts-node` | `10.9.2` |

### Testing

| Package | Version |
|---------|---------|
| `jest` | `29.7.0` |
| `ts-jest` | `29.4.10` |
| `@types/jest` | `29.5.14` |

> **Always run `npm ci` — not `npm install`.**
> `npm ci` installs exactly what is in `package-lock.json` and will error on any mismatch.
> `npm install` can silently upgrade packages and cause version drift across the team.

---

## Setup

```bash
# 1. Clone the repo
git clone https://github.com/solvdinc/agentic-sdlc-pilot.git
cd agentic-sdlc-pilot/aws-migration-kiro

# 2. Switch to the correct Node version (requires nvm)
nvm use

# 3. Install dependencies — use ci, not install
npm ci

# 4. Build
npm run build

# 5. Verify CDK synth works
npx cdk synth
```

---

## Branching Rules

- **Never push directly to `main`.**
- All work goes on a feature branch: `feature/<your-topic>` or `feat/<your-topic>`
- The CI pipeline runs automatically on push to `feature/**` or `feat/**`
- If the pipeline passes, the branch is **automatically merged to main**
- If your branch is **behind main**, the pipeline will fail with the list of missing commits and instructions to rebase

---

## Working on Your Topic

Each team member owns one stack under `lib/topics/`:

| Topic | Directory | Stack name |
|-------|-----------|------------|
| Networking | `lib/topics/01-networking/` | `NetworkingStack` |
| EKS Migration | `lib/topics/02-eks-migration/` | `EksMigrationStack` |
| CloudWatch Dashboards | `lib/topics/03-cloudwatch-dashboards/` | `CloudWatchDashboardsStack` |
| Container Insights | `lib/topics/04-container-insights/` | `ContainerInsightsStack` |
| Kafka / MSK | `lib/topics/05-kafka-msk/` | `KafkaMskStack` |

Synth only your stack:
```bash
npx cdk synth <YourStackName>
```

Diff your stack against what's deployed:
```bash
npx cdk diff <YourStackName>
```

---

## Useful Commands

```bash
npm run build          # compile TypeScript
npm test               # run tests
npx cdk synth          # synthesize all stacks
npx cdk diff           # diff all stacks
npx cdk deploy --all   # deploy everything (use with caution)
```

See [docs/onboarding.md](docs/onboarding.md) for more detail.
