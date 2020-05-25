#!/usr/bin/env node
/* eslint-disable import/newline-after-import */
/* eslint-disable import/order */
/* eslint-disable import/no-extraneous-dependencies, global-require */

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

const { profile, region } = argv;
process.env.AWS_PROFILE = profile;
process.env.AWS_REGION = region;

const tasks = [
  require('./tasks/task_create_repository'),
  require('./tasks/create_lambda_fn'),
];

const runner = new (require('./task_runner/task_runner'))(
  'Scaffold AWS project',
  ...tasks,
);

runner
  .execute()
  // eslint-disable-next-line no-underscore-dangle
  .then(() => runner._rollback(...tasks))
  .catch(() => process.exit(1));
