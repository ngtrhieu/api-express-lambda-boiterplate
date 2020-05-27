#!/usr/bin/env node
/* eslint-disable import/newline-after-import */
/* eslint-disable import/order */
/* eslint-disable import/no-extraneous-dependencies, global-require */

const AWS = require('aws-sdk');
const TaskRunner = require('./task_runner/task_runner');

// Parse command options
const { argv } = require('yargs')
  .option('profile', {
    default: 'default',
    describe: 'The profile AWS will use to scaffold your project',
    type: 'string',
  })
  .option('region', {
    default: 'ap-southeast-1',
    describe: 'The region to scaffold your project',
    type: 'string',
  })
  .help()
  .alias('help', 'h');

(async () => {
  const { profile, region } = argv;
  process.env.AWS_PROFILE = profile;
  process.env.AWS_REGION = region;

  const sts = new AWS.STS();
  const stsResponse = await sts.getCallerIdentity({}).promise();
  process.env.AWS_ACCOUNT_ID = stsResponse.Account;

  const tasks = [
    require('./tasks/check_prerequisites'),
    require('./tasks/create_repository'),
    require('./tasks/create_lambda_fn'),
    require('./tasks/create_build_bucket'),
    require('./tasks/create_codebuild'),
    require('./tasks/create_pipeline'),
  ];

  const runner = new TaskRunner('Scaffold AWS project', ...tasks);
  await runner.execute();

  // eslint-disable-next-line no-underscore-dangle
  await runner._rollback(...tasks);
})();
