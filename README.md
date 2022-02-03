# cdk-docker-creds-action
Github Action to configure cdk-assets for external docker registries.

Use this action to configure cdk-assets to authenticate to external docker registries.

Supports ECR authentication (when `ecrRepository` is enabled) or User/Password authentication (via `secretsManagerSecretId`).

Use multiple times to configure multiple registries.

More info can be found at the [ecr-assets readme](https://www.npmjs.com/package/cdk-assets?activeTab=readme).

## Configuration Options
| Option Name | Type | Required | Description |
| ----------- | ---- | -------- | ----------- |
| `registryHost` | string | yes | Hostname of the docker registry to configure |
| `ecrRepository` | boolean-string | no | Authenticate to the registry using ECR authentication | 
| `secretsManagerSecretId` | string | no | Authenticate to the registry using user/pass credentials from a SecretsManger secret Id or ARN |
| `secretsUsernameField` | string | no | When using with `secretsManagerSecretId`, specify the field containing the username |
| `secretsPasswordField` | string | no | When using with `secretsManagerSecretId`, specify the field containing the password |
| `roleArn` | string | no | Assume the specified IAM role prior before authenticating to the registry |


## Examples
### ECR Registry
```yaml
    steps:
      - uses: sv-oss/cdk-docker-creds-action@v0
        with:
          registryHost: 111111111111.dkr.ecr.ap-southeast-2.amazonaws.com
          ecrRepository: true
```

### Other Registry
```yaml
    steps:
      - uses: sv-oss/cdk-docker-creds-action@v0
        with:
          registryHost: my.private.docker.repo.local
          secretsManagerSecretId: secret-containing-registry-credentials
          secretsUsernameField: username
          secretsPasswordField: password
```
## Developing
```
npm install
npm run all
```

## Testing locally
```
act -W .github/workflows/local-test.yml workflow_dispatch
```