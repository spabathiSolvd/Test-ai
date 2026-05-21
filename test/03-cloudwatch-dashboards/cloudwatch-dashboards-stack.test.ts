import * as cdk from 'aws-cdk-lib';
import { Template, Match } from 'aws-cdk-lib/assertions';
import { CloudWatchDashboardsStack } from '../../lib/topics/03-cloudwatch-dashboards/cloudwatch-dashboards-stack';

// Use a fixed test account ID so tests are not coupled to a real AWS account
const TEST_ACCOUNT = '123456789012';
const TEST_REGION = 'us-east-1';

describe('CloudWatchDashboardsStack', () => {
  let template: Template;

  beforeAll(() => {
    const app = new cdk.App({
      context: {
        // Provide VPC context so ec2.Vpc.fromLookup resolves without a live AWS call
        [`vpc-provider:account=${TEST_ACCOUNT}:filter.isDefault=true:region=${TEST_REGION}:returnAsymmetricSubnets=true`]: {
          vpcId: 'vpc-12345',
          vpcCidrBlock: '172.31.0.0/16',
          availabilityZones: ['us-east-1a', 'us-east-1b'],
          privateSubnetIds: [],
          privateSubnetNames: [],
          privateSubnetRouteTableIds: [],
          publicSubnetIds: ['subnet-11111', 'subnet-22222'],
          publicSubnetNames: ['Public', 'Public'],
          publicSubnetRouteTableIds: ['rtb-11111', 'rtb-22222'],
          isolatedSubnetIds: [],
          isolatedSubnetNames: [],
          isolatedSubnetRouteTableIds: [],
          subnetGroups: [
            {
              name: 'Public',
              type: 'Public',
              subnets: [
                { subnetId: 'subnet-11111', cidr: '172.31.0.0/20', availabilityZone: 'us-east-1a', routeTableId: 'rtb-11111' },
                { subnetId: 'subnet-22222', cidr: '172.31.16.0/20', availabilityZone: 'us-east-1b', routeTableId: 'rtb-22222' },
              ],
            },
          ],
          ownerAccountId: TEST_ACCOUNT,
          region: TEST_REGION,
        },
      },
    });
    const stack = new CloudWatchDashboardsStack(app, 'TestStack', {
      env: { account: TEST_ACCOUNT, region: TEST_REGION },
      owner: 'test-owner',
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });
    template = Template.fromStack(stack);
  });

  // ── Snapshot Test ────────────────────────────────────────────────────────

  test('matches snapshot', () => {
    expect(template.toJSON()).toMatchSnapshot();
  });

  // ── EC2 Instance Assertions (Requirements 1.x) ──────────────────────────

  describe('EC2 Instance', () => {
    test('creates exactly one EC2 instance', () => {
      template.resourceCountIs('AWS::EC2::Instance', 1);
    });

    test('instance uses t3.micro instance type', () => {
      template.hasResourceProperties('AWS::EC2::Instance', {
        InstanceType: 't3.micro',
      });
    });

    test('enforces IMDSv2 via launch template', () => {
      template.hasResourceProperties('AWS::EC2::LaunchTemplate', {
        LaunchTemplateData: {
          MetadataOptions: {
            HttpTokens: 'required',
          },
        },
      });
    });

    test('IAM role trusts ec2.amazonaws.com and has required managed policies', () => {
      template.hasResourceProperties('AWS::IAM::Role', {
        AssumeRolePolicyDocument: {
          Statement: Match.arrayWith([
            Match.objectLike({
              Principal: { Service: 'ec2.amazonaws.com' },
              Action: 'sts:AssumeRole',
            }),
          ]),
        },
        ManagedPolicyArns: Match.arrayWith([
          Match.objectLike({
            'Fn::Join': Match.arrayWith([
              Match.arrayContaining([
                Match.stringLikeRegexp('AmazonSSMManagedInstanceCore'),
              ]),
            ]),
          }),
          Match.objectLike({
            'Fn::Join': Match.arrayWith([
              Match.arrayContaining([
                Match.stringLikeRegexp('CloudWatchAgentServerPolicy'),
              ]),
            ]),
          }),
        ]),
      });
    });

    test('instance has an IamInstanceProfile referencing the instance profile', () => {
      template.hasResourceProperties('AWS::EC2::Instance', {
        IamInstanceProfile: Match.objectLike({ Ref: Match.anyValue() }),
      });
    });
  });

  // ── Log Group Assertions (Requirements 2.x) ─────────────────────────────

  describe('CloudWatch Log Groups', () => {
    test('creates exactly two log groups', () => {
      template.resourceCountIs('AWS::Logs::LogGroup', 2);
    });

    test('system log group has correct name and 7-day retention', () => {
      template.hasResourceProperties('AWS::Logs::LogGroup', {
        LogGroupName: '/ec2/cloudwatch-dashboards/system',
        RetentionInDays: 7,
      });
    });

    test('application log group has correct name and 7-day retention', () => {
      template.hasResourceProperties('AWS::Logs::LogGroup', {
        LogGroupName: '/ec2/cloudwatch-dashboards/application',
        RetentionInDays: 7,
      });
    });

    test('both log groups have DeletionPolicy Delete (RemovalPolicy.DESTROY)', () => {
      const logGroups = template.findResources('AWS::Logs::LogGroup');
      const logGroupEntries = Object.values(logGroups);
      expect(logGroupEntries).toHaveLength(2);
      for (const lg of logGroupEntries) {
        expect((lg as { DeletionPolicy?: string }).DeletionPolicy).toBe('Delete');
      }
    });
  });

  // ── Dashboard Assertions (Requirements 3.x) ─────────────────────────────

  describe('CloudWatch Dashboard', () => {
    test('creates exactly one CloudWatch dashboard', () => {
      template.resourceCountIs('AWS::CloudWatch::Dashboard', 1);
    });

    test('dashboard has the correct name', () => {
      template.hasResourceProperties('AWS::CloudWatch::Dashboard', {
        DashboardName: 'EC2-CloudWatch-Dashboard',
      });
    });

    test('dashboard body contains CPUUtilization metric from AWS/EC2 namespace', () => {
      const dashboards = template.findResources('AWS::CloudWatch::Dashboard');
      const dashboard = Object.values(dashboards)[0] as {
        Properties: { DashboardBody: string | { 'Fn::Sub': string } };
      };
      const bodyRaw = dashboard.Properties.DashboardBody;
      const bodyStr = typeof bodyRaw === 'string' ? bodyRaw : JSON.stringify(bodyRaw);
      expect(bodyStr).toContain('CPUUtilization');
      expect(bodyStr).toContain('AWS/EC2');
    });

    test('dashboard body contains mem_used_percent metric from CWAgent namespace', () => {
      const dashboards = template.findResources('AWS::CloudWatch::Dashboard');
      const dashboard = Object.values(dashboards)[0] as {
        Properties: { DashboardBody: string | { 'Fn::Sub': string } };
      };
      const bodyRaw = dashboard.Properties.DashboardBody;
      const bodyStr = typeof bodyRaw === 'string' ? bodyRaw : JSON.stringify(bodyRaw);
      expect(bodyStr).toContain('mem_used_percent');
      expect(bodyStr).toContain('CWAgent');
    });

    test('dashboard body contains period 300 and stat Average for both metrics', () => {
      const dashboards = template.findResources('AWS::CloudWatch::Dashboard');
      const dashboard = Object.values(dashboards)[0] as {
        Properties: { DashboardBody: string | { 'Fn::Sub': string } };
      };
      const bodyRaw = dashboard.Properties.DashboardBody;
      const bodyStr = typeof bodyRaw === 'string' ? bodyRaw : JSON.stringify(bodyRaw);

      // Parse the JSON body to assert structured values
      const body = JSON.parse(bodyStr);
      const widgets: Array<{
        type: string;
        properties: { metrics: unknown[]; period: number; stat: string };
      }> = body.widgets;

      expect(widgets).toBeDefined();
      expect(widgets.length).toBeGreaterThanOrEqual(2);

      for (const widget of widgets) {
        expect(widget.properties.period).toBe(300);
        expect(widget.properties.stat).toBe('Average');
      }
    });
  });

  // ── Alarm Assertions ─────────────────────────────────────────────────────

  describe('CloudWatch Alarms', () => {
    test('creates a high CPU alarm with 80% threshold', () => {
      template.hasResourceProperties('AWS::CloudWatch::Alarm', {
        MetricName: 'CPUUtilization',
        Namespace: 'AWS/EC2',
        Threshold: 80,
        EvaluationPeriods: 2,
        TreatMissingData: 'notBreaching',
      });
    });
  });

  // ── Output Assertions ────────────────────────────────────────────────────

  describe('Stack Outputs', () => {
    test('exports InstanceId output', () => {
      template.hasOutput('InstanceId', {
        Export: Match.objectLike({ Name: Match.stringLikeRegexp('InstanceId') }),
      });
    });

    test('exports DashboardUrl output', () => {
      template.hasOutput('DashboardUrl', {
        Export: Match.objectLike({ Name: Match.stringLikeRegexp('DashboardUrl') }),
      });
    });
  });
});
