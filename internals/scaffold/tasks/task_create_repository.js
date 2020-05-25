/* eslint-disable import/order */
/* eslint-disable import/no-extraneous-dependencies */
const AWS = require('aws-sdk');
const shell = require('shelljs');
const Task = require('../task_runner/task');
const Step = require('../task_runner/step');

const { name, description } = JSON.parse(
  require('fs').readFileSync('package.json'),
);

const task = (() => {
  let repositoryUrl = '';

  return new Task(
    'Create CodeCommit repository',

    new Step({
      name: 'Check project name',
      execute: async () => {
        if (name === 'api-express-server-boiterplate') {
          throw new Error(
            'Please run `yarn init` to re-initialize your project with new name',
          );
        }
      },
    }),

    new Step({
      name: 'Create repository',
      execute: async () => {
        const client = new AWS.CodeCommit();
        const response = await client
          .createRepository({
            repositoryName: name,
            repositoryDescription: description,
          })
          .promise();
        repositoryUrl = response.repositoryMetadata.cloneUrlSsh;
      },
      rollback: () => {
        const client = new AWS.CodeCommit();
        return client.deleteRepository({
          repositoryName: name,
        });
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
        shell.exec('git remote remove origin');
        shell.exec(`git remote add origin ${repositoryUrl}`);
        shell.exec('git push -u origin master');
      },
    }),
  );
})();

module.exports = task;
