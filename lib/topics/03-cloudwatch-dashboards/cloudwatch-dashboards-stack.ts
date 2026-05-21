import * as cdk from 'aws-cdk-lib';
import * as cloudwatch from 'aws-cdk-lib/aws-cloudwatch';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as logs from 'aws-cdk-lib/aws-logs';
import { Construct } from 'constructs';

/**
 * Configuration props for CloudWatchDashboardsStack.
 * Extends standard StackProps with project-specific options.
 */
export interface CloudWatchDashboardsStackProps extends cdk.StackProps {
  /** Tag value for the Owner dimension. Defaults to 'unset'. */
  readonly owner?: string;
  /**
   * Removal policy applied to CloudWatch log groups.
   * Use RemovalPolicy.DESTROY in dev, RemovalPolicy.RETAIN in prod.
   * Defaults to RETAIN.
   */
  readonly removalPolicy?: cdk.RemovalPolicy;
}

/**
 * Deploys an EC2 instance with CloudWatch Agent, log groups,
 * and a metrics dashboard for CPU and memory utilization.
 *
 * Resources created:
 * - IAM role with SSM and CloudWatch Agent managed policies
 * - EC2 t3.micro instance (Amazon Linux 2, IMDSv2 enforced)
 * - Two CloudWatch log groups (system + application, 7-day retention)
 * - CloudWatch dashboard with CPU and memory widgets
 * - CloudWatch alarm for high CPU utilization
 */
export class CloudWatchDashboardsStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: CloudWatchDashboardsStackProps) {
    super(scope, id, {
      ...props,
      description: 'EC2 instance with CloudWatch Agent, log groups, and a metrics dashboard for CPU and memory utilization',
    });

    const removalPolicy = props.removalPolicy ?? cdk.RemovalPolicy.RETAIN;

    // ── Subtask 1.1: IAM Role ──────────────────────────────────────────────
    // Trust principal: ec2.amazonaws.com
    // Managed policies: AmazonSSMManagedInstanceCore, CloudWatchAgentServerPolicy
    const role = new iam.Role(this, 'CloudWatchDashboardsRole', {
      description: 'Allows EC2 to send logs and metrics via CloudWatch Agent and be managed via SSM',
      assumedBy: new iam.ServicePrincipal('ec2.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonSSMManagedInstanceCore'),
        iam.ManagedPolicy.fromAwsManagedPolicyName('CloudWatchAgentServerPolicy'),
      ],
    });

    // ── Subtask 1.2: EC2 Instance ──────────────────────────────────────────
    // Default VPC lookup, t3.micro, Amazon Linux 2, IMDSv2 enforced, role attached
    const vpc = ec2.Vpc.fromLookup(this, 'DefaultVpc', { isDefault: true });

    // Explicit security group — no open ingress, HTTPS-only egress to AWS endpoints
    const sg = new ec2.SecurityGroup(this, 'InstanceSG', {
      vpc,
      description: 'CloudWatch dashboards EC2 instance — SSM + HTTPS egress only',
      allowAllOutbound: false,
    });
    sg.addEgressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(443), 'HTTPS to AWS service endpoints');

    const instance = new ec2.Instance(this, 'CloudWatchDashboardsInstance', {
      vpc,
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.MICRO),
      machineImage: ec2.MachineImage.latestAmazonLinux2(),
      requireImdsv2: true,
      role,
      securityGroup: sg,
    });

    // ── Subtask 1.3: Resource Tags ─────────────────────────────────────────
    cdk.Tags.of(this).add('Project', 'agentic-sdlc-pilot');
    cdk.Tags.of(this).add('Owner', props.owner ?? 'unset');
    cdk.Tags.of(this).add('Topic', '03-cloudwatch-dashboards');

    // ── Subtask 2.1: CloudWatch Log Groups ────────────────────────────────
    // System log group: 7-day retention
    new logs.LogGroup(this, 'SystemLogGroup', {
      logGroupName: '/ec2/cloudwatch-dashboards/system',
      retention: logs.RetentionDays.ONE_WEEK,
      removalPolicy,
    });

    // Application log group: 7-day retention
    new logs.LogGroup(this, 'ApplicationLogGroup', {
      logGroupName: '/ec2/cloudwatch-dashboards/application',
      retention: logs.RetentionDays.ONE_WEEK,
      removalPolicy,
    });

    // ── Subtask 3.1: CloudWatch Metrics Dashboard ─────────────────────────
    // CPU utilization metric from AWS/EC2 namespace
    const cpuMetric = new cloudwatch.Metric({
      namespace: 'AWS/EC2',
      metricName: 'CPUUtilization',
      dimensionsMap: { InstanceId: instance.instanceId },
      period: cdk.Duration.seconds(300),
      statistic: 'Average',
    });

    // Memory utilization metric from CWAgent namespace (CloudWatch Agent)
    const memMetric = new cloudwatch.Metric({
      namespace: 'CWAgent',
      metricName: 'mem_used_percent',
      dimensionsMap: { InstanceId: instance.instanceId },
      period: cdk.Duration.seconds(300),
      statistic: 'Average',
    });

    // Dashboard with two GraphWidgets, one per metric
    const dashboard = new cloudwatch.Dashboard(this, 'EC2CloudWatchDashboard', {
      dashboardName: 'EC2-CloudWatch-Dashboard',
    });

    dashboard.addWidgets(
      new cloudwatch.GraphWidget({
        title: 'CPU Utilization',
        left: [cpuMetric],
        width: 12,
        height: 6,
      }),
      new cloudwatch.GraphWidget({
        title: 'Memory Utilization',
        left: [memMetric],
        width: 12,
        height: 6,
      }),
    );

    // ── Subtask 3.2: CloudWatch Alarm ─────────────────────────────────────
    // Alert when CPU exceeds 80% for two consecutive 5-minute periods
    new cloudwatch.Alarm(this, 'HighCpuAlarm', {
      metric: cpuMetric,
      threshold: 80,
      evaluationPeriods: 2,
      alarmDescription: 'CPU utilization exceeded 80% for 10 consecutive minutes',
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
    });

    // ── Outputs ────────────────────────────────────────────────────────────
    new cdk.CfnOutput(this, 'InstanceId', {
      value: instance.instanceId,
      description: 'EC2 instance ID',
      exportName: `${this.stackName}-InstanceId`,
    });

    new cdk.CfnOutput(this, 'DashboardUrl', {
      value: `https://${cdk.Aws.REGION}.console.aws.amazon.com/cloudwatch/home#dashboards:name=EC2-CloudWatch-Dashboard`,
      description: 'CloudWatch dashboard URL',
      exportName: `${this.stackName}-DashboardUrl`,
    });
  }
}
