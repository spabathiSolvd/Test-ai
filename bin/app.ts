#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { CloudWatchDashboardsStack } from '../lib/topics/03-cloudwatch-dashboards/cloudwatch-dashboards-stack';

// Resolve account and region from environment variables set by the CDK toolkit
// or CI. When neither is present, CDK synthesizes in environment-agnostic mode
// (tokens resolve at deploy time), which is safe for feature-branch CI synth.
const account = process.env.CDK_DEFAULT_ACCOUNT ?? process.env.AWS_ACCOUNT_ID;
const region = process.env.CDK_DEFAULT_REGION ?? process.env.AWS_REGION;

const app = new cdk.App();

new CloudWatchDashboardsStack(app, 'CloudWatchDashboardsStack', {
  env: {
    account: account ?? undefined,
    region: region ?? undefined,
  },
  owner: process.env.STACK_OWNER ?? 'unset',
  removalPolicy: cdk.RemovalPolicy.DESTROY, // override to RETAIN for production
});
