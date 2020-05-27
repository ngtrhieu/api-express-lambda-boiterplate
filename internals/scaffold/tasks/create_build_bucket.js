/* eslint-disable import/order */
/* eslint-disable import/no-extraneous-dependencies */
const AWS = require('aws-sdk');
const logger = require('../logger');
const Task = require('../task_runner/task');
const Step = require('../task_runner/step');

const constants = require('./constants');

const task = (() =>
  new Task(
    'Create Build bucket',

    new Step({
      name: 'Creating S3 bucket',
      execute: async () => {
        logger.debug(
          `Creating a S3 bucket named ${constants.artifactBucketName} to store build artifacts`,
        );

        const s3 = new AWS.S3();
        const params = {
          Bucket: constants.artifactBucketName,
          CreateBucketConfiguration: {
            LocationConstraint: process.env.AWS_REGION,
          },
        };
        await s3.createBucket(params).promise();

        logger.debug(`Bucket ${constants.artifactBucketName} created`);
      },

      rollback: async () => {
        logger.debug(`Deleting bucket ${constants.artifactBucketName}`);
        const s3 = new AWS.S3();
        await s3
          .deleteBucket({ Bucket: constants.artifactBucketName })
          .promise();
        logger.debug(`Bucket ${constants.artifactBucketName} deleted`);
      },
    }),
  ))();

module.exports = task;
