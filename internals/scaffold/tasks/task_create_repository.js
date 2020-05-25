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

  new Step(
    'Create repository',
    () => {
      const client = new AWS.CodeCommit();
      return client
        .createRepository({
          repositoryName: name,
          repositoryDescription: description,
        })
        .promise();
    },
    () => {
      const client = new AWS.CodeCommit();
      return client.deleteRepository({
        repositoryName: name,
      });
    },
  ),
);

module.exports = task;
