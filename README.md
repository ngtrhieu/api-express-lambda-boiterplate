# api-express-lambda-boiterplate
A base express API server wrapped in AWS lambda

## Motivation
Act as the template Express server. Come with scritps to help provision necessary AWS resources to host and develop the server.

## Getting started

### Setup your project
1. Clone the project.
2. `yarn init` to reconfigure your project.
3. `yarn install` to install all npm dependencies.
3. `yarn start` to start your server locally.
4. Verify that the API server is working by sending a GET request to /version. i.e: `curl localhost:3000/version`. It should return a minimal information you setup during `yarn init`.

### Scaffold AWS resources

**Prerequisites:**
1. aws-cli installed. Run `aws --version` to check that you have it installed.
2. An aws-cli profile configured. If you don't, run `aws configure` to setup one.
3. git cli installed. *(should be, unless you got this repo via a usb stick)*
4. Other things that I might have forgotten to list here.

**Start Scaffolding:**

Simply run following command:
`yarn scaffold --profile <your_aws_cli_profile> --region <your_aws_region>`

If anything went wrong during the scaffolding, the script *should* automatically rollback itself before terminating. Please to not stop the script halfway less you know exactly how to clean up its mess.

Also, you are encourage to read the scaffolding log to figure out what is going on.
