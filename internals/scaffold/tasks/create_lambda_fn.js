/* eslint-disable global-require */
/* eslint-disable import/order */
/* eslint-disable import/no-extraneous-dependencies */
const AWS = require('aws-sdk');
const shell = require('shelljs');
const logger = require('../logger');
const Task = require('../task_runner/task');
const Step = require('../task_runner/step');

const { name: projectName } = JSON.parse(
  require('fs').readFileSync('package.json'),
);

const task = (() => {
  let accountId;
  const lambdaRoleName = `${projectName}ApiLambdaRole`;

  return new Task(
    `Create new lambda function`,

    require('../steps/check_project_name'),

    new Step({
      name: 'Creating execution role for Lambda',
      execute: async () => {
        logger.debug(
          'Create a role for AWS Lambda to assume during its execution',
        );

        const sts = new AWS.STS();
        const stsResponse = await sts.getCallerIdentity({}).promise();
        accountId = stsResponse.Account;

        const rolePolicy = {
          // Allow lambda service to assume this role
          Version: '2012-10-17',
          Statement: [
            {
              Effect: 'Allow',
              Principal: {
                Service: 'lambda.amazonaws.com',
              },
              Action: 'sts:AssumeRole',
            },
          ],
        };

        const params = {
          AssumeRolePolicyDocument: JSON.stringify(rolePolicy),
          RoleName: lambdaRoleName,
          Description: `IAM Role for executing lambda function. Assigned to the lambda running express API server for project ${projectName}.`,
          MaxSessionDuration: 3600,
        };

        const iam = new AWS.IAM();
        const response = await iam.createRole(params).promise();
        logger.debug(`Role ${response.Role.Arn} created`);
      },

      rollback: async () => {
        logger.debug(`Deleting IAM role ${lambdaRoleName}`);
        const iam = new AWS.IAM();
        await iam.deleteRole({ RoleName: lambdaRoleName }).promise();
      },
    }),

    new Step({
      name: 'Attach inline policy',

      execute: async () => {
        logger.debug(
          'Attach an inline policy on the IAM Role above that allow Lambda to logs to CloudWatch and setup EC2 connecting to VPC',
        );

        const iam = new AWS.IAM();
        await iam
          .putRolePolicy({
            PolicyDocument: JSON.stringify({
              Version: '2012-10-17',
              Statement: [
                {
                  // For logging to CloudWatch
                  Effect: 'Allow',
                  Action: [
                    'logs:CreateLogGroup',
                    'logs:CreateLogStream',
                    'logs:PutLogEvents',
                  ],
                  Resource: `arn:aws:logs:${process.env.AWS_REGION}:${accountId}:*`,
                },
                {
                  // For creating VPC for its EC2 instance
                  Effect: 'Allow',
                  Action: [
                    'ec2:CreateNetworkInterface',
                    'ec2:DescribeNetworkInterfaces',
                    'ec2:DeleteNetworkInterface',
                  ],
                  Resource: `arn:aws:ec2:${process.env.AWS_REGION}:${accountId}:*`,
                },
              ],
            }),
            PolicyName: 'InlinePolicy',
            RoleName: lambdaRoleName,
          })
          .promise();
        logger.debug(`Inline policy attached`);
      },

      rollback: async () => {
        logger.debug('Remove inline policy');
        const iam = new AWS.IAM();
        await iam
          .deleteRolePolicy({
            PolicyName: 'InlinePolicy',
            RoleName: lambdaRoleName,
          })
          .promise();
        logger.debug('Inline policy removed');
      },
    }),

    new Step({
      name: 'Build and package project',
      execute: async () => {
        logger.debug(
          'Package the current inital project in to lambda.zip to upload alongside the new lambda function',
        );
        shell.exec('yarn zip');
      },
      rollback: () => {
        logger.debug('Deleting the lambda.zip file');
        shell.exec('rm lambda.zip');
      },
    }),

    new Step({
      name: 'Creating lamba function',
      execute: async () => {
        const params = {
          Code: {
            ZipFile: require('fs').readFileSync('lambda.zip'),
          },
          FunctionName: projectName,
          Handler: 'index.handle',
          Role: `arn:aws:iam::${accountId}:role/${lambdaRoleName}`,
          Runtime: 'nodejs12.x',
          Description: `Lambda function executing api-express-server for ${projectName}`,
          Environment: {
            Variables: {
              NODE_ENV: 'production',
            },
          },
          MemorySize: 128,
          Publish: false,
        };

        const lambda = new AWS.Lambda();
        const { FunctionArn: functionArn } = await lambda
          .createFunction(params)
          .promise();

        logger.debug(`Function ${functionArn} created`);
      },

      rollback: async () => {
        logger.debug(`Deleting Lambda function ${projectName}`);
        const lambda = new AWS.Lambda();
        await lambda.deleteFunction({ FunctionName: projectName }).promise();
      },
    }),
  );
})();

module.exports = task;
