const {
  name: projectName,
  description: projectDescription,
  repository: originalRepositoryUrl,
} = JSON.parse(require('fs').readFileSync('package.json'));

/** CodeCommit repository name */
const codeCommitRepositoryName = projectName;

/** CodeCommit repository description */
const codeCommitRepositoryDescription = projectDescription;

/** CodeCommit repository ARN */
const codeCommitRepositoryArn = `arn:aws:codecommit:${process.env.AWS_REGION}:${process.env.AWS_ACCOUNT_ID}:${codeCommitRepositoryName}`;

/** CodeCommit repository uri */
const codeCommitRepositoryUrl = `ssh://git-codecommit.${process.env.AWS_REGION}.amazonaws.com/v1/repos/${codeCommitRepositoryName}`;

/** Lambda function name */
const lambdaFunctionName = projectName;

/** Lambda function description */
const lambdaFunctionDescription = `Lambda function executing api-express-server for ${projectName}`;

/**
 * The role name of the role assumed by Lambda when running the server.
 */
const lambdaRoleName = `${lambdaFunctionName}LambdaRole`;

/**
 * The role description of the role assumed by Lambda when running the server.
 */
const lambdaRoleDescription = `IAM Role for Lambda to assume when executing function. Assigned to the Lambda running server for project ${projectName}.`;

/**
 * The role ARN of the role assumed by Lambda when running the server.
 */
const lambdaRoleArn = `arn:aws:iam::${process.env.AWS_ACCOUNT_ID}:role/${lambdaRoleName}`;

/**
 * The name of the bucket storing build artifacts.
 * Managed by CodePipeline.
 */
const artifactBucketName = `${projectName.toLowerCase()}-codepipeline-artifacts`;

/**
 * CodeBuild project name.
 */
const codeBuildProjectName = projectName;

/**
 * CodeBuild project description.
 */
const codeBuildProjectDescription = `CodeBuild project for ${projectName}`;

/**
 * The role name of the role assumed by CodeBuild when building the project.
 */
const codeBuildRoleName = `${projectName}CodeBuildRole`;

const codeBuildRoleDescription = `IAM Role for CodeBuild to assume when building CodeCommit project, as part of the CodePipeline continuous delivery for project ${projectName}.`;

/**
 * The role ARN of the role assumed by CodeBuild when building the project.
 */
const codeBuildRoleArn = `arn:aws:iam::${process.env.AWS_ACCOUNT_ID}:role/${codeBuildRoleName}`;

/**
 * ARN of the encryption key used in code build.
 */
const codeBuildEncryptionKeyArn = `arn:aws:kms:${process.env.AWS_REGION}:${process.env.AWS_ACCOUNT_ID}:alias/aws/s3`;

/**
 * CloudWatch group for CodeBuild to log into.
 */
const codeBuildLogGroupArn = `/aws/codebuild/${projectName}`;

/**
 * CodePipeline project name.
 */
const codePipelineProjectName = projectName;

/**
 * CodePipeline project ARN.
 */
const codePipelineProjectArn = `arn:aws:codepipeline:${process.env.AWS_REGION}:${process.env.AWS_ACCOUNT_ID}:${codePipelineProjectName}`;

/**
 * The name of the role assumed by CodePipeline when building the project.
 */
const codePipelineRoleName = `${projectName}CodePipelineRole`;

/**
 * The description of the role assumed by CodePipeline when building the project.
 */
const codePipelineRoleDescription = `IAM Role for CodePipeline to assume when executing the pipeline for project ${projectName}.`;

/**
 * The role ARN of the role assumed by CodePipeline when building the project.
 */
const codePipelineRoleArn = `arn:aws:iam::${process.env.AWS_ACCOUNT_ID}:role/${codePipelineRoleName}`;

const cloudWatchRuleName = `${projectName}CloudWatchRule-ExecutePipeline`;

const cloudWatchRuleDescription = `Trigger whenever the "master" branch of ${codeCommitRepositoryName} repository is pushed. Execute pipeline ${codePipelineProjectName} for project ${projectName}`;

const cloudWatchRoleName = `${projectName}CloudWatchRole`;

const cloudWatchRoleDescription = `IAM Role for CloudWatch to assume when watching code changes in CodeCommit and triggering CodePipeline execution for ${projectName}`;

const cloudWatchRoleArn = `arn:aws:iam::${process.env.AWS_ACCOUNT_ID}:role/${cloudWatchRoleName}`;

module.exports = {
  projectName,
  originalRepositoryUrl,

  codeCommitRepositoryName,
  codeCommitRepositoryDescription,
  codeCommitRepositoryArn,
  codeCommitRepositoryUrl,

  lambdaFunctionName,
  lambdaFunctionDescription,
  lambdaRoleName,
  lambdaRoleDescription,
  lambdaRoleArn,

  artifactBucketName,

  codeBuildProjectName,
  codeBuildProjectDescription,
  codeBuildRoleName,
  codeBuildRoleDescription,
  codeBuildRoleArn,
  codeBuildEncryptionKeyArn,
  codeBuildLogGroupArn,

  codePipelineProjectName,
  codePipelineProjectArn,
  codePipelineRoleName,
  codePipelineRoleDescription,
  codePipelineRoleArn,

  cloudWatchRuleName,
  cloudWatchRuleDescription,
  cloudWatchRoleName,
  cloudWatchRoleDescription,
  cloudWatchRoleArn,
};
