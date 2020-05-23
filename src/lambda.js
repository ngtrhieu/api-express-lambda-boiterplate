/**
 * Lambda wrapper to deploy to AWS
 */

/* eslint-disable no-underscore-dangle */
/* eslint-disable no-console */

import awsServerlessExpress from 'aws-serverless-express';
import app from './app';

const server = awsServerlessExpress.createServer(app);
exports.handler = (event, context) => {
  // HACK to make winston works!
  delete console._stdout;
  delete console._stderr;

  awsServerlessExpress.proxy(server, event, context);
};
