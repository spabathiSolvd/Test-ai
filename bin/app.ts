#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { CloudWatchDashboardsStack } from '../lib/topics/03-cloudwatch-dashboards/cloudwatch-dashboards-stack';

const account = process.env.AWS_ACCOUNT_ID ?? process.env.CDK_DEFAULT_ACCOUNT;
const region = process.env.AWS_REGION ?? process.env.CDK_DEFAULT_REGION;

if (!region) {
  throw new Error('AWS_REGION (or CDK_DEFAULT_REGION) environment variable is required');
}

if (!account) {
  throw new Error('AWS_ACCOUNT_ID (or CDK_DEFAULT_ACCOUNT) environment variable is required');
}

const app = new cdk.App();

new CloudWatchDashboardsStack(app, 'CloudWatchDashboardsStack', {
  env: { account, region },
  owner: process.env.STACK_OWNER ?? 'unset',
  removalPolicy: cdk.RemovalPolicy.DESTROY, // override to RETAIN for production
});
