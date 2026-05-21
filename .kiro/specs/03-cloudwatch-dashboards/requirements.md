# Requirements Document

## Introduction

This feature implements the `CloudWatchDashboardsStack` CDK stack for the `agentic-sdlc-pilot` project (topic 03). The stack provisions an EC2 instance, CloudWatch Log Groups for that instance, and a CloudWatch Metrics Dashboard displaying CPU and memory utilization. The GitHub Actions CI/CD workflow for this topic is also extended with a CD (deploy) stage. All changes are scoped to `lib/topics/03-cloudwatch-dashboards/`, `bin/app.ts`, and `.github/workflows/ci-cloudwatch-dashboards.yml`.

## Glossary

- **Stack**: An AWS CDK `Stack` class that synthesizes into a CloudFormation stack.
- **CloudWatchDashboardsStack**: The CDK Stack class defined in `lib/topics/03-cloudwatch-dashboards/cloudwatch-dashboards-stack.ts`.
- **CDK_App**: The CDK application entry point defined in `bin/app.ts`.
- **EC2_Instance**: The AWS EC2 virtual machine resource provisioned inside `CloudWatchDashboardsStack`.
- **Log_Group**: An AWS CloudWatch Logs log group resource associated with the EC2 instance.
- **Dashboard**: An AWS CloudWatch Metrics dashboard resource that displays EC2 metrics.
- **CI_Workflow**: The GitHub Actions workflow file at `.github/workflows/ci-cloudwatch-dashboards.yml`.
- **Shared_Action**: The reusable composite GitHub Actions action at `.github/actions/cdk-ci/action.yml` that performs setup-node, npm ci, npm run build, npm test, and cdk synth.
- **IMDSv2**: Instance Metadata Service version 2, the secure token-based metadata access method for EC2.
- **CloudWatch_Agent**: The AWS Systems Manager agent configuration that enables memory metric collection from EC2 instances.

---

## Requirements

### Requirement 1: EC2 Instance Construct

**User Story:** As a developer, I want an EC2 instance provisioned inside `CloudWatchDashboardsStack`, so that I have a compute resource whose metrics and logs can be observed via CloudWatch.

#### Acceptance Criteria

1. THE `CloudWatchDashboardsStack` SHALL define an `EC2_Instance` resource using `aws-cdk-lib/aws-ec2`.
2. WHEN the `CloudWatchDashboardsStack` is synthesized, THE `CDK_App` SHALL produce a CloudFormation template containing exactly one `AWS::EC2::Instance` resource.
3. THE `EC2_Instance` SHALL use an Amazon Linux 2 AMI (`MachineImage.latestAmazonLinux2()`).
4. THE `EC2_Instance` SHALL use instance type `t3.micro`.
5. THE `EC2_Instance` SHALL be placed in the default VPC of the target AWS account.
6. THE `EC2_Instance` SHALL enforce IMDSv2 by setting `requireImdsv2: true` on the instance.
7. THE `EC2_Instance` SHALL be assigned an IAM role whose `ManagedPolicyArns` property contains `arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore` and whose trust principal is `ec2.amazonaws.com`, enabling Systems Manager access without SSH.
8. THE `EC2_Instance` SHALL be assigned an IAM role whose `ManagedPolicyArns` property contains `arn:aws:iam::aws:policy/CloudWatchAgentServerPolicy` and whose trust principal is `ec2.amazonaws.com`, enabling the CloudWatch Agent to publish metrics and logs.
9. WHEN the `CloudWatchDashboardsStack` is synthesized, THE `CDK_App` SHALL produce a CloudFormation template where the `AWS::EC2::Instance` resource's `IamInstanceProfile` property references the logical ID of the `AWS::IAM::InstanceProfile` resource defined in the same template.
10. THE `EC2_Instance` and its associated IAM resources SHALL be tagged with `Project`, `Owner`, and `Topic` tags consistent with the project's resource tagging standards.

---

### Requirement 2: CloudWatch Log Groups

**User Story:** As an operator, I want CloudWatch Log Groups created for the EC2 instance, so that application and system logs are retained and queryable in CloudWatch Logs.

#### Acceptance Criteria

1. THE `CloudWatchDashboardsStack` SHALL define a `Log_Group` named `/ec2/cloudwatch-dashboards/system` using `aws-cdk-lib/aws-logs`.
2. THE `CloudWatchDashboardsStack` SHALL define a `Log_Group` named `/ec2/cloudwatch-dashboards/application` using `aws-cdk-lib/aws-logs`.
3. THE `/ec2/cloudwatch-dashboards/system` `Log_Group` SHALL have a retention period of 7 days (`RetentionDays.ONE_WEEK`).
4. THE `/ec2/cloudwatch-dashboards/application` `Log_Group` SHALL have a retention period of 7 days (`RetentionDays.ONE_WEEK`).
5. WHEN the `CloudWatchDashboardsStack` is synthesized, THE `CDK_App` SHALL produce a CloudFormation template containing exactly two `AWS::Logs::LogGroup` resources with the names and retention values specified above.
6. THE `CloudWatchDashboardsStack` SHALL set `removalPolicy: RemovalPolicy.DESTROY` on each `Log_Group` so that the log groups are deleted when the CDK stack is destroyed during development teardown.
7. THE two `Log_Group` resources SHALL be tagged with `Project`, `Owner`, and `Topic` tags consistent with the project's resource tagging standards.

---

### Requirement 3: CloudWatch Metrics Dashboard

**User Story:** As an operator, I want a CloudWatch Metrics Dashboard showing CPU and memory utilization for the EC2 instance, so that I can monitor instance health at a glance.

#### Acceptance Criteria

1. THE `CloudWatchDashboardsStack` SHALL define a `Dashboard` named `EC2-CloudWatch-Dashboard` using `aws-cdk-lib/aws-cloudwatch`.
2. THE `Dashboard` SHALL contain a `GraphWidget` displaying the `CPUUtilization` metric from the `AWS/EC2` namespace, dimensioned by the `InstanceId` of the `EC2_Instance`.
3. THE `Dashboard` SHALL contain a `GraphWidget` displaying the `mem_used_percent` metric from the `CWAgent` namespace, dimensioned by the `InstanceId` of the `EC2_Instance`, to show memory utilization collected by the `CloudWatch_Agent`.
4. THE `CPUUtilization` widget SHALL use a period of 300 seconds and the `Average` statistic.
5. THE `mem_used_percent` widget SHALL use a period of 300 seconds and the `Average` statistic.
6. WHEN the `CloudWatchDashboardsStack` is synthesized, THE `CDK_App` SHALL produce a CloudFormation template containing exactly one `AWS::CloudWatch::Dashboard` resource whose `DashboardBody` contains both the string `CPUUtilization` and the string `mem_used_percent`.

---

### Requirement 4: CDK App Stack Registration

**User Story:** As a developer, I want `CloudWatchDashboardsStack` registered in `bin/app.ts`, so that `cdk synth` and `cdk deploy` can target it by name.

#### Acceptance Criteria

1. THE `CDK_App` SHALL instantiate `CloudWatchDashboardsStack` using the construct ID `'CloudWatchDashboardsStack'`, which also becomes the deployed CloudFormation stack name.
2. THE `CDK_App` SHALL pass an `env` object specifying `account: process.env.AWS_ACCOUNT_ID` and `region: 'us-east-1'` when instantiating `CloudWatchDashboardsStack`.
3. WHEN `cdk synth CloudWatchDashboardsStack` is executed, THE command SHALL exit with code 0 and produce a non-empty CloudFormation template on stdout.
4. WHEN `cdk ls` is executed, THE `CDK_App` SHALL list `CloudWatchDashboardsStack` as an available stack.

---

### Requirement 5: GitHub Actions CI Stage

**User Story:** As a developer, I want the CI workflow to build, test, and synthesize `CloudWatchDashboardsStack` on every relevant push and pull request, so that regressions are caught before merge.

#### Acceptance Criteria

1. WHEN a push is made to a branch matching `feature/**` or `feat/**` and the changed files include paths under `lib/topics/03-cloudwatch-dashboards/**`, THE `CI_Workflow` SHALL trigger the `build-and-synth` job.
2. WHEN a pull request targeting `main` is opened or updated and the changed files include paths under `lib/topics/03-cloudwatch-dashboards/**`, THE `CI_Workflow` SHALL trigger the `build-and-synth` job.
3. THE `build-and-synth` job SHALL include an `actions/checkout@v4` step before invoking the composite action at `.github/actions/cdk-ci` with `stack-name: 'CloudWatchDashboardsStack'`.
4. THE `build-and-synth` job SHALL run on `ubuntu-latest`.

---

### Requirement 6: GitHub Actions CD Stage

**User Story:** As a developer, I want the CI workflow to deploy `CloudWatchDashboardsStack` to AWS after a successful build on the `main` branch, so that infrastructure changes are automatically applied.

#### Acceptance Criteria

1. THE `CI_Workflow` `on:` block SHALL include a `push` trigger for the `main` branch scoped to paths under `lib/topics/03-cloudwatch-dashboards/**`, so that the `deploy` job can be triggered on merges to `main`.
2. THE `CI_Workflow` SHALL contain a `deploy` job that runs only when `github.ref == 'refs/heads/main'` and `github.event_name == 'push'`.
3. THE `deploy` job SHALL declare `needs: build-and-synth` so that deployment only proceeds after a successful CI stage.
4. THE `deploy` job SHALL run on `ubuntu-latest`.
5. THE `deploy` job SHALL configure AWS credentials using `aws-actions/configure-aws-credentials@v4` with `${{ secrets.AWS_ACCESS_KEY_ID }}` and `${{ secrets.AWS_SECRET_ACCESS_KEY }}` secrets and target region `us-east-1`.
6. WHEN the `deploy` job runs, THE `CI_Workflow` SHALL execute `npm ci`, `npm run build`, and then `npx cdk deploy CloudWatchDashboardsStack --require-approval never` as separate steps.
7. THE `deploy` job SHALL set the `CDK_DEFAULT_ACCOUNT` environment variable to `${{ vars.AWS_ACCOUNT_ID }}` (defaulting to `575458732775`) and `CDK_DEFAULT_REGION` to `us-east-1` so that the CDK app resolves the correct environment without hardcoding the account ID in the workflow file.
