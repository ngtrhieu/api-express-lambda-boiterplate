/* eslint-disable import/order */
/* eslint-disable import/no-extraneous-dependencies */
const AWS = require('aws-sdk');
// const shell = require('shelljs');
const logger = require('../logger');
const Task = require('../task_runner/task');
const Step = require('../task_runner/step');

const { name: projectName } = JSON.parse(
  require('fs').readFileSync('package.json'),
);

const task = (() => {
  let codePipelineRoleArn;
  const codePipelineRoleName = `${projectName}CodePipelineRole`;
  const bucketName = `${projectName.toLowerCase()}-codepipeline-artifacts`;

  return new Task(
    'Create pipeline',

    new Step({
      name: 'Creating S3 bucket',
      execute: async () => {
        logger.debug(
          `Creating a S3 bucket named ${bucketName} to store build artifacts`,
        );

        const s3 = new AWS.S3();
        const params = {
          Bucket: bucketName,
          CreateBucketConfiguration: {
            LocationConstraint: process.env.AWS_REGION,
          },
        };
        await s3.createBucket(params).promise();

        logger.debug(`Bucket ${bucketName} created`);
      },

      rollback: async () => {
        logger.debug(`Deleting bucket ${bucketName}`);
        const s3 = new AWS.S3();
        await s3.deleteBucket({ Bucket: bucketName }).promise();
        logger.debug(`Bucket ${bucketName} deleted`);
      },
    }),

    new Step({
      name: 'Create IAM Role',
      execute: async () => {
        logger.debug('Create execution Role for CodePipeline');

        const rolePolicy = {
          // Allow CodePipeline service to assume this role
          Version: '2012-10-17',
          Statement: [
            {
              Effect: 'Allow',
              Principal: {
                Service: 'codepipeline.amazonaws.com',
              },
              Action: 'sts:AssumeRole',
            },
          ],
        };

        const params = {
          AssumeRolePolicyDocument: JSON.stringify(rolePolicy),
          RoleName: codePipelineRoleName,
          Description: `IAM Role for CodePipeline. Assigned to the CodePipeline project performing continuous delivery for project ${projectName}.`,
          MaxSessionDuration: 3600,
        };

        const iam = new AWS.IAM();

        const response = await iam.createRole(params).promise();
        codePipelineRoleArn = response.Role.Arn;

        logger.debug(`Role ${codePipelineRoleArn} created`);
      },

      rollback: async () => {
        logger.debug(`Deleting IAM role ${codePipelineRoleName}`);
        const iam = new AWS.IAM();
        await iam.deleteRole({ RoleName: codePipelineRoleName }).promise();
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
                  Action: ['iam:PassRole'],
                  Resource: `*`,
                  Effect: 'Allow',
                  Condition: {
                    StringEqualsIfExists: {
                      'iam:PassedToService': [
                        'cloudformation.amazonaws.com',
                        'elasticbeanstalk.amazonaws.com',
                        'ec2.amazonaws.com',
                        'ecs-tasks.amazonaws.com',
                      ],
                    },
                  },
                },
                {
                  Action: [
                    'codecommit:CancelUploadArchive',
                    'codecommit:GetBranch',
                    'codecommit:GetCommit',
                    'codecommit:GetUploadArchiveStatus',
                    'codecommit:UploadArchive',
                  ],
                  Resource: `*`,
                  Effect: 'Allow',
                },
                {
                  Action: [
                    'codedeploy:CreateDeployment',
                    'codedeploy:GetApplication',
                    'codedeploy:GetApplicationRevision',
                    'codedeploy:GetDeployment',
                    'codedeploy:GetDeploymentConfig',
                    'codedeploy:RegisterApplicationRevision',
                  ],
                  Resource: `*`,
                  Effect: 'Allow',
                },
                {
                  Action: ['codestar-connections:UseConnection'],
                  Resource: `*`,
                  Effect: 'Allow',
                },
                {
                  Action: [
                    'elasticbeanstalk:*',
                    'ec2:*',
                    'elasticloadbalancing:*',
                    'autoscaling:*',
                    'cloudwatch:*',
                    's3:*',
                    'sns:*',
                    'cloudformation:*',
                    'rds:*',
                    'sqs:*',
                    'ecs:*',
                  ],
                  Resource: `*`,
                  Effect: 'Allow',
                },
                {
                  Action: ['lambda:InvokeFunction', 'lambda:ListFunctions'],
                  Resource: `*`,
                  Effect: 'Allow',
                },
                {
                  Action: [
                    'opsworks:CreateDeployment',
                    'opsworks:DescribeApps',
                    'opsworks:DescribeCommands',
                    'opsworks:DescribeDeployments',
                    'opsworks:DescribeInstances',
                    'opsworks:DescribeStacks',
                    'opsworks:UpdateApp',
                    'opsworks:UpdateStack',
                  ],
                  Resource: `*`,
                  Effect: 'Allow',
                },
                {
                  Action: [
                    'cloudformation:CreateStack',
                    'cloudformation:DeleteStack',
                    'cloudformation:DescribeStacks',
                    'cloudformation:UpdateStack',
                    'cloudformation:CreateChangeSet',
                    'cloudformation:DeleteChangeSet',
                    'cloudformation:DescribeChangeSet',
                    'cloudformation:ExecuteChangeSet',
                    'cloudformation:SetStackPolicy',
                    'cloudformation:ValidateTemplate',
                  ],
                  Resource: `*`,
                  Effect: 'Allow',
                },
                {
                  Action: ['codebuild:BatchGetBuilds', 'codebuild:StartBuild'],
                  Resource: `*`,
                  Effect: 'Allow',
                },
                {
                  Effect: 'Allow',
                  Action: [
                    'devicefarm:ListProjects',
                    'devicefarm:ListDevicePools',
                    'devicefarm:GetRun',
                    'devicefarm:GetUpload',
                    'devicefarm:CreateUpload',
                    'devicefarm:ScheduleRun',
                  ],
                  Resource: `*`,
                },
                {
                  Effect: 'Allow',
                  Action: [
                    'servicecatalog:ListProvisioningArtifacts',
                    'servicecatalog:CreateProvisioningArtifact',
                    'servicecatalog:DescribeProvisioningArtifact',
                    'servicecatalog:DeleteProvisioningArtifact',
                    'servicecatalog:UpdateProduct',
                  ],
                  Resource: `*`,
                },
                {
                  Effect: 'Allow',
                  Action: ['cloudformation:ValidateTemplate'],
                  Resource: `*`,
                },
                {
                  Effect: 'Allow',
                  Action: ['ecr:DescribeImages'],
                  Resource: `*`,
                },
              ],
            }),
            PolicyName: 'InlinePolicy',
            RoleName: codePipelineRoleName,
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
            RoleName: codePipelineRoleName,
          })
          .promise();
      },
    }),

    new Step({
      name: 'Create CodePipeline',
      execute: async () => {
        logger.debug(
          'Waiting about 30s for the above IAM role to propagate throughout the AWS system',
        );
        logger.debug('NOTE TO SELF: Go grab a coffee');
        await new Promise(resolve => setTimeout(resolve, 30000));

        logger.debug(`Creating pipeline ${projectName}`);
        const params = {
          pipeline: {
            artifactStore: {
              location: bucketName,
              type: 'S3',
            },
            name: projectName,
            roleArn: codePipelineRoleArn,
            stages: [
              {
                actions: [
                  {
                    actionTypeId: {
                      category: 'Source',
                      owner: 'AWS',
                      provider: 'CodeCommit',
                      version: '1',
                    },
                    configuration: {
                      BranchName: 'master',
                      PollForSourceChanges: 'false',
                      RepositoryName: projectName,
                    },
                    inputArtifacts: [],
                    name: 'Source',
                    namespace: 'SourceVariables',
                    outputArtifacts: [
                      {
                        name: 'SourceArtifact',
                      },
                    ],
                    region: process.env.AWS_REGION,
                    runOrder: 1,
                  },
                ],
                name: 'Source',
              },
              {
                actions: [
                  {
                    actionTypeId: {
                      category: 'Build',
                      owner: 'AWS',
                      provider: 'CodeBuild',
                      version: '1',
                    },
                    configuration: {
                      ProjectName: projectName,
                    },
                    inputArtifacts: [
                      {
                        name: 'SourceArtifact',
                      },
                    ],
                    name: 'Build',
                    namespace: 'BuildVariables',
                    outputArtifacts: [
                      {
                        name: 'BuildArtifact',
                      },
                    ],
                    region: process.env.AWS_REGION,
                    runOrder: 1,
                  },
                ],
                name: 'Build',
              },
              {
                actions: [
                  {
                    actionTypeId: {
                      category: 'Invoke',
                      owner: 'AWS',
                      provider: 'Lambda',
                      version: '1',
                    },
                    configuration: {
                      FunctionName: 'codepipeline-deploy-s3-to-lambda',
                      UserParameters: projectName,
                    },
                    inputArtifacts: [
                      {
                        name: 'BuildArtifact',
                      },
                    ],
                    name: 'DeployFunctionCode',
                    outputArtifacts: [],
                    region: process.env.AWS_REGION,
                    runOrder: 1,
                  },
                ],
                name: 'Deploy',
              },
            ],
          },
        };

        const client = new AWS.CodePipeline();
        const { pipeline } = await client.createPipeline(params).promise();

        logger.debug(`Pipeline ${pipeline.name} created`);
      },

      rollback: async () => {
        logger.debug(`Deleting pipeline ${projectName}`);
        const client = new AWS.CodePipeline();
        await client.deletePipeline({ name: projectName }).promise();
        logger.debug(`pipeline ${projectName} deleted`);
      },
    }),
  );
})();

module.exports = task;
