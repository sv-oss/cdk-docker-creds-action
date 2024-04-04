import { github, javascript } from 'projen';
import { GitHubActionTypeScriptProject, RunsUsing } from 'projen-github-action-typescript';

const project = new GitHubActionTypeScriptProject({

  defaultReleaseBranch: 'main',
  devDeps: [
    'projen-github-action-typescript',
  ],
  name: 'cdk-docker-creds-action',
  packageManager: javascript.NodePackageManager.NPM,
  projenrcTs: true,
  minNodeVersion: '20.12.1',
  depsUpgradeOptions: {
    workflowOptions: {
      projenCredentials: github.GithubCredentials.fromApp({
        appIdSecret: 'CICD_APP_ID',
        privateKeySecret: 'CICD_APP_PRIVKEY',
      }),
      labels: ['deps-upgrade'],
    },
  },
  autoApproveOptions: {
    label: 'deps-upgrade',
    allowedUsernames: [],
  },
  dependabot: false,
  mutableBuild: false,
  minMajorVersion: 1,
  license: 'MIT',
  copyrightOwner: 'Service Victoria',
  actionMetadata: {
    author: 'Service Victoria Platform Engineering',
    description: 'Github Action to configure cdk-assets for external docker registries',
    runs: {
      using: RunsUsing.NODE_20,
      main: 'dist/index.js',
    },
    inputs: {
      registryHost: {
        description: 'Hostname of the docker registry to configure',
        required: true,
      },
      secretsManagerSecretId: {
        description: 'Authenticate to the registry using user/pass credentials from a SecretsManger secret Id or ARN',
        required: false,
      },
      ecrRepository: {
        description: 'Authenticate to the registry using ECR authentication',
        required: false,
      },
      secretsUsernameField: {
        description: 'When using with secretsManagerSecretId, specify the field containing the username',
        required: false,
      },
      secretsPasswordField: {
        description: 'When using with secretsManagerSecretId, specify the field containing the password',
        required: false,
      },
      roleArn: {
        description: 'Assume the specified IAM role before authenticating to the registry',
        required: false,
      },
    },
  },
});

// Build the project after upgrading so that the compiled JS ends up being committed
project.tasks.tryFind('post-upgrade')?.spawn(project.buildTask);

project.release?.addJobs({
  'floating-tags': {
    permissions: {
      contents: github.workflows.JobPermission.WRITE,
    },
    runsOn: ['ubuntu-latest'],
    needs: ['release_github'],
    steps: [
      { uses: 'actions/checkout@v4' },
      { uses: 'giantswarm/floating-tags-action@v1' },
    ],
  },
});

project.synth();