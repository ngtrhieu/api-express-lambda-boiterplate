/* eslint-disable import/order */
/* eslint-disable import/no-extraneous-dependencies */
const AWS = require('aws-sdk');
const shell = require('shelljs');
const logger = require('../logger');
const Task = require('../task_runner/task');
const Step = require('../task_runner/step');

const constants = require('./constants');

const task = (() =>
  new Task(
    'Check prerequisites',

    new Step({
      name: 'Check project name',
      execute: async () => {
        logger.debug('Make sure the project has been reinitialized.');
        if (constants.projectName === 'api-express-server-boiterplate') {
          throw new Error(
            'Please run `yarn init` to re-initialize your project with new name',
          );
        }
      },
    }),

    new Step({
      name: 'Git available?',
      execute: async () => {
        logger.debug('Make sure Git can be invoked via cli.');
        if (!shell.which('git')) {
          throw new Error('git cannot be found.');
        }
      },
    }),

    new Step({
      name: 'Check "codepipeline-deploy-s3-to-lambda" function exists',
      execute: async () => {
        logger.debug(
          'Make sure "codepipeline-deploy-s3-to-lambda" exists on Lambda, since we will use this function to deploy our codes to Lambda, as part of the CodePipeline deploy stage',
        );
        const lambda = new AWS.Lambda();
        await lambda
          .getFunction({ FunctionName: 'codepipeline-deploy-s3-to-lamba' })
          .promise();
      },
    }),
  ))();

module.exports = task;
