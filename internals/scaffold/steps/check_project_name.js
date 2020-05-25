/* eslint-disable import/order */

const Step = require('../task_runner/step');
const logger = require('../logger');

const { name: projectName } = JSON.parse(
  require('fs').readFileSync('package.json'),
);

module.exports = new Step({
  name: 'Check project name',
  execute: async () => {
    logger.debug('Make sure the project has been reinitialized.');
    if (projectName === 'api-express-server-boiterplate') {
      throw new Error(
        'Please run `yarn init` to re-initialize your project with new name',
      );
    }
  },
});
