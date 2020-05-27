# Scaffold a new API service.

## Overview:

This script will scaffold a new API service on AWS by doing:

- Setup an **AWS Lambda** function execute this API project.

- Setup an **CodePipeline project** to automatically build and deploy this repo
  to the Lambda function created above, whenever `master` is updated.

## Prerequisites:

This script will use your current **AWS default profile** with its **configuration** to scaffold your project. Make sure your profile have _at least_ these permissions:

-
-
-

Change your default profile by [reading this documentation](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-files.html).

## What will be created?


