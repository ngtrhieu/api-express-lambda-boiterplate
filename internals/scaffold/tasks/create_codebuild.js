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
    'Setup CodeBuild project',

    new Step({
      name: 'Create IAM Role',
      execute: async () => {
        logger.debug('Create execution Role for CodeBuild');

        const rolePolicy = {
          // Allow CodeBuild service to assume this role
          Version: '2012-10-17',
          Statement: [
            {
              Effect: 'Allow',
              Principal: {
                Service: 'codebuild.amazonaws.com',
              },
              Action: 'sts:AssumeRole',
            },
          ],
        };

        const params = {
          AssumeRolePolicyDocument: JSON.stringify(rolePolicy),
          RoleName: constants.codeBuildRoleName,
          Description: constants.codeBuildRoleDescription,
          MaxSessionDuration: 3600,
        };

        const iam = new AWS.IAM();
        const response = await iam.createRole(params).promise();
        const codeBuildRoleArn = response.Role.Arn;

        logger.debug(`Role ${codeBuildRoleArn} created`);
      },

      rollback: async () => {
        logger.debug(`Deleting IAM role ${constants.codeBuildRoleName}`);
        const iam = new AWS.IAM();
        await iam
          .deleteRole({ RoleName: constants.codeBuildRoleName })
          .promise();
      },
    }),

    new Step({
      name: 'Attach inline policy',

      execute: async () => {
        logger.debug(
          'Attach an inline policy on the IAM Role above that allow CodePipeline to do various actions (such as pulling from CodeCommit, logging to CloudWatch, etc.)',
        );

        const iam = new AWS.IAM();
        await iam
          .putRolePolicy({
            PolicyDocument: JSON.stringify({
              Version: '2012-10-17',
              Statement: [
                {
                  Effect: 'Allow',
                  Resource: [
                    `arn:aws:logs:${process.env.AWS_REGION}:${process.env.AWS_ACCOUNT_ID}:log-group:/aws/codebuild/${constants.projectName}`,
                    `arn:aws:logs:${process.env.AWS_REGION}:${process.env.AWS_ACCOUNT_ID}:log-group:/aws/codebuild/${constants.projectName}:*`,
                  ],
                  Action: [
                    'logs:CreateLogGroup',
                    'logs:CreateLogStream',
                    'logs:PutLogEvents',
                  ],
                },
                {
                  Effect: 'Allow',
                  Resource: `arn:aws:s3:::${constants.artifactBucketName}/*`,
                  Action: [
                    's3:PutObject',
                    's3:GetObject',
                    's3:GetObjectVersion',
                    's3:GetBucketAcl',
                    's3:GetBucketLocation',
                  ],
                },
                {
                  Effect: 'Allow',
                  Action: [
                    'codebuild:CreateReportGroup',
                    'codebuild:CreateReport',
                    'codebuild:UpdateReport',
                    'codebuild:BatchPutTestCases',
                  ],
                  Resource: [
                    `arn:aws:codebuild:${process.env.AWS_REGION}:${process.env.AWS_ACCOUNT_ID}:report-group/${constants.projectName}*`,
                  ],
                },
              ],
            }),
            PolicyName: 'InlinePolicy',
            RoleName: constants.codeBuildRoleName,
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
            RoleName: constants.codeBuildRoleName,
          })
          .promise();
      },
    }),

    new Step({
      name: 'Create CodeBuild project',
      execute: async () => {
        logger.debug(
          'Waiting about 30s for the above IAM role to propagate throughout the AWS system',
        );
        logger.debug('NOTE TO SELF: Stand up and stretch 💪💪💪');
        await new Promise(resolve => setTimeout(resolve, 30000));

        logger.debug(`Creating CodeBuild project ${constants.projectName}`);
        const params = {
          artifacts: {
            encryptionDisabled: false,
            packaging: 'NONE',
            type: 'CODEPIPELINE',
          },
          cache: {
            type: 'NO_CACHE',
          },
          description: constants.codeBuildProjectDescription,
          encryptionKey: constants.codeBuildEncryptionKeyArn,
          environment: {
            computeType: 'BUILD_GENERAL1_SMALL',
            environmentVariables: [],
            image: 'aws/codebuild/amazonlinux2-x86_64-standard:3.0',
            imagePullCredentialsType: 'CODEBUILD',
            privilegedMode: false,
            type: 'LINUX_CONTAINER',
          },
          logsConfig: {
            cloudWatchLogs: {
              groupName: constants.codeBuildLogGroupArn,
              status: 'ENABLED',
            },
            s3Logs: {
              encryptionDisabled: false,
              status: 'DISABLED',
            },
          },
          name: constants.codeBuildProjectName,
          queuedTimeoutInMinutes: 480,
          secondarySourceVersions: [],
          serviceRole: constants.codeBuildRoleArn,
          source: {
            insecureSsl: false,
            type: 'CODEPIPELINE',
          },
          timeoutInMinutes: 60,
        };

        const client = new AWS.CodeBuild();
        const { project } = await client.createProject(params).promise();

        logger.debug(`CodeBuild project ${project.name} created`);
      },

      rollback: async () => {
        logger.debug(
          `Deleting CodeBuild project ${constants.codeBuildProjectName}`,
        );
        const client = new AWS.CodeBuild();
        await client
          .deleteProject({ name: constants.codeBuildProjectName })
          .promise();
        logger.debug(
          `CodeBuild project ${constants.codeBuildProjectName} deleted`,
        );
      },
    }),
  ))();

module.exports = task;
