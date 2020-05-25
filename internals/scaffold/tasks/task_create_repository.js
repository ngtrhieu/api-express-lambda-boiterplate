/* eslint-disable import/order */
/* eslint-disable import/no-extraneous-dependencies */
const AWS = require('aws-sdk');
const shell = require('shelljs');
const logger = require('../logger');
const Task = require('../task_runner/task');
const Step = require('../task_runner/step');

const {
  name: projectName,
  description: projectDescription,
  repository,
} = JSON.parse(require('fs').readFileSync('package.json'));

const task = (() =>
  new Task(
    'Create CodeCommit repository',

    new Step({
      name: 'Check project name',
      execute: async () => {
        if (projectName === 'api-express-server-boiterplate') {
          throw new Error(
            'Please run `yarn init` to re-initialize your project with new name',
          );
        }
      },
    }),

    new Step({
      name: 'Create repository',
      execute: async () => {
        logger.debug(`Create a new CodeCommit repository`);
        const client = new AWS.CodeCommit();
        const { repositoryMetadata } = await client
          .createRepository({
            repositoryName: projectName,
            repositoryDescription: projectDescription,
          })
          .promise();

        logger.debug(`Repository ${repositoryMetadata.Arn} created`);
      },
      rollback: async () => {
        logger.debug(`Deleting repository ${projectName}`);
        const client = new AWS.CodeCommit();
        await client
          .deleteRepository({
            repositoryName: projectName,
          })
          .promise();
      },
    }),

    new Step({
      name: 'Is Git available?',
      execute: async () => {
        if (!shell.which('git')) {
          throw new Error('git cannot be found.');
        }
      },
    }),

    new Step({
      name: 'Push code to new repo',
      execute: async () => {
        const url = `ssh://git-codecommit.${process.env.AWS_REGION}.amazonaws.com/v1/repos/${projectName}`;
        logger.debug(`Update the git origin to ${url}`);

        shell.exec('git remote remove origin >> /dev/null');
        shell.exec(`git remote add origin ${url} >> /dev/null`);
      },

      rollback: async () => {
        logger.debug(`Change the git origin back to ${repository}`);

        shell.exec('git remote remove origin >> /dev/null');
        shell.exec(`git remote add origin ${repository} >> /dev/null`);
      },
    }),

    new Step({
      name: 'Push source code to the repository',
      exec: async () => {
        logger.debug('Pushing source code to the CodeCommit repository');
        shell.exec('git push -u origin master >> /dev/null');
      },
    }),
  ))();

module.exports = task;
