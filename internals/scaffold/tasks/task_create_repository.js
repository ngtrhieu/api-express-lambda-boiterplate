/* eslint-disable import/order */
/* eslint-disable import/no-extraneous-dependencies */
const AWS = require('aws-sdk');
const Task = require('../task_runner/task');
const Step = require('../task_runner/step');

const { name, description } = JSON.parse(
  require('fs').readFileSync('package.json'),
);

const task = new Task(
  'Create CocdeCommit repository',

  new Step({
    name: 'Check project name',
    execute: () =>
      new Promise((resolve, reject) => {
        if (name === 'express-server-boiterplate') {
          reject(
            new Error(
              'Please run `yarn init` to re-initialize your project with new name',
            ),
          );
        }
        resolve();
      }),
  }),

  new Step({
    name: 'Create repository',
    execute: () => {
      const client = new AWS.CodeCommit();
      return client
        .createRepository({
          repositoryName: name,
          repositoryDescription: description,
        })
        .promise();
    },
    rollback: () => {
      const client = new AWS.CodeCommit();
      return client.deleteRepository({
        repositoryName: name,
      });
    },
  }),
);

module.exports = task;
