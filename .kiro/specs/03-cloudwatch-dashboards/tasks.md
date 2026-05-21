# Implementation Plan: CloudWatch Dashboards (Topic 03)

## Overview

Implement `CloudWatchDashboardsStack` — a CDK TypeScript stack that provisions an EC2 instance with an IAM role, two CloudWatch Log Groups, and a CloudWatch Metrics Dashboard. Register the stack in `bin/app.ts`, write CDK assertions tests, and extend the GitHub Actions workflow with a CD deploy job.

All implementation is confined to three files plus one new test file:
- `lib/topics/03-cloudwatch-dashboards/cloudwatch-dashboards-stack.ts` (create)
- `bin/app.ts` (update)
- `.github/workflows/ci-cloudwatch-dashboards.yml` (update)
- `test/03-cloudwatch-dashboards/cloudwatch-dashboards-stack.test.ts` (create)

## Tasks

- [x] 1. Implement `CloudWatchDashboardsStack` — IAM role and EC2 instance
  - [x] 1.1 Scaffold the stack class and implement the IAM role
    - Create `lib/topics/03-cloudwatch-dashboards/cloudwatch-dashboards-stack.ts`
    - Export `CloudWatchDashboardsStack extends cdk.Stack`
    - Import `aws-cdk-lib/aws-iam` and define an `iam.Role` with trust principal `ec2.amazonaws.com`
    - Attach managed policies `AmazonSSMManagedInstanceCore` and `CloudWatchAgentServerPolicy`
    - _Requirements: 1.1, 1.7, 1.8_

  - [x] 1.2 Add the EC2 instance with IMDSv2 and the IAM role attached
    - Import `aws-cdk-lib/aws-ec2`
    - Look up the default VPC with `ec2.Vpc.fromLookup(this, 'DefaultVpc', { isDefault: true })`
    - Define `ec2.Instance` with `instanceType: ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.MICRO)`, `machineImage: ec2.MachineImage.latestAmazonLinux2()`, `requireImdsv2: true`, and the role from 1.1
    - _Requirements: 1.2, 1.3, 1.4, 1.5, 1.6, 1.9_

  - [x] 1.3 Apply resource tags to the stack
    - Call `cdk.Tags.of(this).add(...)` for `Project: agentic-sdlc-pilot`, `Owner: Sridhar`, `Topic: 03-cloudwatch-dashboards`
    - _Requirements: 1.10, 2.7_

- [x] 2. Implement CloudWatch Log Groups
  - [x] 2.1 Define the two Log Groups with 7-day retention and DESTROY removal policy
    - Import `aws-cdk-lib/aws-logs`
    - Define `logs.LogGroup` for `/ec2/cloudwatch-dashboards/system` with `retention: logs.RetentionDays.ONE_WEEK` and `removalPolicy: cdk.RemovalPolicy.DESTROY`
    - Define `logs.LogGroup` for `/ec2/cloudwatch-dashboards/application` with the same retention and removal policy
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

- [x] 3. Implement the CloudWatch Metrics Dashboard
  - [x] 3.1 Define the dashboard with CPU and memory GraphWidgets
    - Import `aws-cdk-lib/aws-cloudwatch`
    - Create a `cloudwatch.Metric` for `CPUUtilization` in namespace `AWS/EC2` with `dimensionsMap: { InstanceId: instance.instanceId }`, `period: cdk.Duration.seconds(300)`, `statistic: 'Average'`
    - Create a `cloudwatch.Metric` for `mem_used_percent` in namespace `CWAgent` with the same dimensions, period, and statistic
    - Define `cloudwatch.Dashboard` named `EC2-CloudWatch-Dashboard` and add two `cloudwatch.GraphWidget` constructs, one per metric
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

- [ ] 4. Checkpoint — verify stack synthesizes cleanly
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Register the stack in `bin/app.ts`
  - [x] 5.1 Wire `CloudWatchDashboardsStack` into the CDK app entry point
    - Open `bin/app.ts` and add the CDK `App` instantiation if not present
    - Import `CloudWatchDashboardsStack` from `../lib/topics/03-cloudwatch-dashboards/cloudwatch-dashboards-stack`
    - Instantiate `new CloudWatchDashboardsStack(app, 'CloudWatchDashboardsStack', { env: { account: process.env.AWS_ACCOUNT_ID, region: 'us-east-1' } })`
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [ ] 6. Write CDK assertions tests
  - [ ] 6.1 Create the test file and write EC2 instance assertions
    - Create `test/03-cloudwatch-dashboards/cloudwatch-dashboards-stack.test.ts`
    - Synthesize the stack with a test `cdk.App` using `Template.fromStack`
    - Assert `resourceCountIs('AWS::EC2::Instance', 1)`
    - Assert `hasResourceProperties('AWS::EC2::Instance', { InstanceType: 't3.micro' })`
    - Assert `hasResourceProperties('AWS::EC2::LaunchTemplate', { LaunchTemplateData: { MetadataOptions: { HttpTokens: 'required' } } })` for IMDSv2
    - Assert IAM role trust principal is `ec2.amazonaws.com` and both managed policy ARNs are present
    - Assert the instance's `IamInstanceProfile` references the instance profile logical ID
    - _Requirements: 1.2, 1.3, 1.4, 1.6, 1.7, 1.8, 1.9_

  - [ ] 6.2 Write Log Group assertions
    - Assert `resourceCountIs('AWS::Logs::LogGroup', 2)`
    - Assert `hasResourceProperties` for `/ec2/cloudwatch-dashboards/system` with `RetentionInDays: 7`
    - Assert `hasResourceProperties` for `/ec2/cloudwatch-dashboards/application` with `RetentionInDays: 7`
    - Assert both log groups have `DeletionPolicy: 'Delete'`
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

  - [ ] 6.3 Write Dashboard assertions
    - Assert `resourceCountIs('AWS::CloudWatch::Dashboard', 1)`
    - Assert `hasResourceProperties('AWS::CloudWatch::Dashboard', { DashboardName: 'EC2-CloudWatch-Dashboard' })`
    - Parse the `DashboardBody` JSON string and assert it contains `CPUUtilization`, `AWS/EC2`, `mem_used_percent`, `CWAgent`, `period: 300`, and `stat: 'Average'`
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

  - [ ]* 6.4 Add a CDK snapshot test
    - Call `expect(template.toJSON()).toMatchSnapshot()` to capture the full synthesized template
    - Any future unintended structural change will cause this test to fail
    - _Requirements: 1.2, 2.5, 3.6_

- [x] 7. Extend the GitHub Actions workflow with a CD deploy job
  - [x] 7.1 Add the `push: main` trigger and the `deploy` job to the workflow file
    - Open `.github/workflows/ci-cloudwatch-dashboards.yml`
    - Add `main` to the `push.branches` list and add `lib/topics/03-cloudwatch-dashboards/**` to `push.paths` for the `main` trigger
    - Add a `deploy` job with `needs: build-and-synth`, `if: github.ref == 'refs/heads/main' && github.event_name == 'push'`, running on `ubuntu-latest`
    - Set env vars `CDK_DEFAULT_ACCOUNT: ${{ vars.AWS_ACCOUNT_ID }}` and `CDK_DEFAULT_REGION: us-east-1`
    - Add steps: `actions/checkout@v4`, `aws-actions/configure-aws-credentials@v4` (with `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` secrets, region `us-east-1`), `npm ci`, `npm run build`, `npx cdk deploy CloudWatchDashboardsStack --require-approval never`
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7_

- [ ] 8. Final checkpoint — ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- PBT does not apply to this feature — CDK synthesis is deterministic with no variable input space; all correctness checks use `aws-cdk-lib/assertions` (see design Correctness Properties section)
- The snapshot test (6.4) is optional but recommended — run `jest --updateSnapshot` to create the initial snapshot after the stack is implemented
- `ec2.Vpc.fromLookup` requires a concrete account/region in the stack `env` prop; the `bin/app.ts` registration in task 5.1 satisfies this
- The `deploy` job in task 7.1 requires `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` to be configured as GitHub Actions secrets in the repository settings

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2"] },
    { "id": 2, "tasks": ["1.3", "2.1"] },
    { "id": 3, "tasks": ["3.1"] },
    { "id": 4, "tasks": ["5.1"] },
    { "id": 5, "tasks": ["6.1", "6.2", "6.3"] },
    { "id": 6, "tasks": ["6.4", "7.1"] }
  ]
}
```
