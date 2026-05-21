#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { CloudWatchDashboardsStack } from '../lib/topics/03-cloudwatch-dashboards/cloudwatch-dashboards-stack';

// Fall back to CDK's environment-agnostic placeholders when explicit values
// are not provided. This allows `cdk synth` to succeed in CI without real
// AWS credentials (e.g. on feature-branch builds).
// const account =
//   process.env.AWS_ACCOUNT_ID ??
//   process.env.CDK_DEFAULT_ACCOUNT ??
//   process.env.CDK_DEFAULT_ACCOUNT; // resolved by CDK toolkit at deploy time

// const region =
//   process.env.AWS_REGION ??
//   process.env.CDK_DEFAULT_REGION;

  const app = new cdk.App();

const envName = (app.node.tryGetContext('envName') as 'dev' | 'staging' | 'prod') ?? 'dev';
const account = process.env.CDK_DEFAULT_ACCOUNT ?? process.env.AWS_ACCOUNT_ID ?? '575458732775';
const region = process.env.CDK_DEFAULT_REGION ?? 'us-east-1';


const env: cdk.Environment = { account, region };

new CloudWatchDashboardsStack(app, 'CloudWatchDashboardsStack', {
  // When account/region are undefined CDK uses environment-agnostic synthesis,
  // which is fine for CI synth checks on feature branches.
  env: {
    account: account ?? undefined,
    region: region ?? undefined,
  },
  owner: process.env.STACK_OWNER ?? 'unset',
  removalPolicy: cdk.RemovalPolicy.DESTROY, // override to RETAIN for production
});
