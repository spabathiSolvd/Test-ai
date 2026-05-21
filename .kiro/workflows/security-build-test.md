# Shared Workflow: Security → Build → Test

This workflow should be followed before opening any PR that modifies infrastructure code.

## Steps

### 1. Security Scan
Run the security scanner agent against your changes:
- Check IAM roles and policies for least-privilege compliance
- Verify security groups have no overly permissive ingress rules
- Confirm all resources are tagged correctly

### 2. Build
```bash
npm run build
```
Ensure TypeScript compiles with zero errors.

### 3. CDK Synth
```bash
npx cdk synth
```
Confirm your stack synthesizes without errors or warnings.

### 4. Test
```bash
npm test
```
All tests must pass. New infrastructure should have at least a snapshot test.

### 5. Diff (optional but recommended)
```bash
npx cdk diff
```
Review what will actually change in AWS before deploying.

## CI Enforcement

Each topic has a dedicated GitHub Actions workflow (`.github/workflows/ci-<topic>.yml`) that runs steps 2–4 automatically on push and PR. The security scan is enforced via the `security-hook.json` Kiro hook on file save.
