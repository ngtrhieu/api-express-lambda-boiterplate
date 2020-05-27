/* eslint-disable global-require */
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
    'Create CodeCommit repository',

    new Step({
      name: 'Create repository',
      execute: async () => {
        logger.debug(
          `Create a new CodeCommit repository ${constants.codeCommitRepositoryName}`,
        );

        const client = new AWS.CodeCommit();
        const { repositoryMetadata } = await client
          .createRepository({
            repositoryName: constants.codeCommitRepositoryName,
            repositoryDescription: constants.codeCommitRepositoryDescription,
          })
          .promise();

        logger.debug(`Repository ${repositoryMetadata.Arn} created`);
      },

      rollback: async () => {
        logger.debug(
          `Deleting repository ${constants.codeCommitRepositoryName}`,
        );

        const client = new AWS.CodeCommit();
        await client
          .deleteRepository({
            repositoryName: constants.codeCommitRepositoryName,
          })
          .promise();
      },
    }),

    new Step({
      name: 'Push code to new repo',
      execute: async () => {
        logger.debug(
          `Update the git origin to ${constants.codeCommitRepositoryUrl}`,
        );

        shell.exec('git remote remove origin >> /dev/null');
        shell.exec(
          `git remote add origin ${constants.codeCommitRepositoryUrl} >> /dev/null`,
        );
      },

      rollback: async () => {
        logger.debug(
          `Change the git origin back to ${constants.originalRepositoryUrl}`,
        );

        shell.exec('git remote remove origin >> /dev/null');
        shell.exec(
          `git remote add origin ${constants.originalRepositoryUrl} >> /dev/null`,
        );
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
