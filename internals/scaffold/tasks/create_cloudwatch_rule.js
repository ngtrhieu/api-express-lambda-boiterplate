/* eslint-disable no-param-reassign */
/* eslint-disable import/order */
/* eslint-disable import/no-extraneous-dependencies */
const AWS = require('aws-sdk');
// const shell = require('shelljs');
const logger = require('../logger');
const Task = require('../task_runner/task');
const Step = require('../task_runner/step');

const constants = require('./constants');

const task = (() =>
  new Task(
    'Setup CloudWatch Rule',

    new Step({
      name: 'Create IAM Role',
      execute: async () => {
        logger.debug('Create execution Role for CloudWatch');

        const rolePolicy = {
          // Allow CloudWatch service to assume this role
          Version: '2012-10-17',
          Statement: [
            {
              Effect: 'Allow',
              Principal: {
                Service: 'events.amazonaws.com',
              },
              Action: 'sts:AssumeRole',
            },
          ],
        };

        const params = {
          AssumeRolePolicyDocument: JSON.stringify(rolePolicy),
          RoleName: constants.cloudWatchRoleName,
          Description: constants.cloudWatchRoleDescription,
          MaxSessionDuration: 3600,
        };

        const iam = new AWS.IAM();
        const response = await iam.createRole(params).promise();

        logger.debug(`Role ${response.Role.Arn} created`);
      },

      rollback: async () => {
        logger.debug(`Deleting IAM role ${constants.cloudWatchRoleName}`);
        const iam = new AWS.IAM();
        await iam
          .deleteRole({ RoleName: constants.cloudWatchRoleName })
          .promise();
      },
    }),

    new Step({
      name: 'Attach inline policy',

      execute: async () => {
        logger.debug(
          'Attach an inline policy on the IAM Role above that allow CloudWatch to trigger CodePipeline execution',
        );

        const iam = new AWS.IAM();
        await iam
          .putRolePolicy({
            PolicyDocument: JSON.stringify({
              Version: '2012-10-17',
              Statement: [
                {
                  Effect: 'Allow',
                  Action: ['codepipeline:StartPipelineExecution'],
                  Resource: constants.codePipelineProjectArn,
                },
              ],
            }),
            PolicyName: 'InlinePolicy',
            RoleName: constants.cloudWatchRoleName,
          })
          .promise();
        logger.debug('Inline policy attached');
      },

      rollback: async () => {
        logger.debug('Remove inline policy');
        const iam = new AWS.IAM();
        await iam
          .deleteRolePolicy({
            PolicyName: 'InlinePolicy',
            RoleName: constants.cloudWatchRoleName,
          })
          .promise();
      },
    }),

    new Step({
      name: 'Create CloudWatch Rule',
      execute: async () => {
        logger.debug(
          'Waiting about 30s for the above IAM role to propagate throughout the AWS system',
        );
        logger.debug('NOTE TO SELF: Drink more water 💦💦💦');
        await new Promise(resolve => setTimeout(resolve, 30000));

        logger.debug(
          `Creating CloudWatch rule ${constants.cloudWatchRuleName}.`,
        );
        const params = {
          Name: constants.cloudWatchRuleName,
          Description: constants.cloudWatchRuleDescription,
          EventBusName: 'default',
          RoleArn: constants.cloudWatchRuleArn,
          EventPattern: JSON.stringify({
            source: ['aws.codecommit'],
            'detail-type': ['CodeCommit Repository State Change'],
            resources: [constants.codeCommitRepositoryArn],
            detail: {
              event: ['referenceCreated', 'referenceUpdated'],
              referenceType: ['branch'],
              referenceName: ['master'],
            },
          }),
          State: 'ENABLED',
        };

        const client = new AWS.CloudWatchEvents();
        const response = await client.putRule(params).promise();

        logger.debug(`CloudWatch rule ${response.RuleArn} created`);
      },

      rollback: async () => {
        logger.debug(
          `Deleting CloudWatch rule ${constants.cloudWatchRuleName}`,
        );
        const client = new AWS.CloudWatchEvents();
        await client
          .deleteRule({
            Name: constants.cloudWatchRuleName,
            EventBusName: 'default',
            Force: true,
          })
          .promise();
        logger.debug(`CloudWatch rule ${constants.cloudWatchRuleName} deleted`);
      },
    }),
  ))();

module.exports = task;
