import { mkdtempSync, readFileSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import * as path from 'path';
import * as core from '@actions/core';

const configLocationEnvVar = 'CDK_DOCKER_CREDS_FILE';

interface DomainConfig {
  readonly ecrRepository?: boolean;
  readonly secretsManagerSecretId?: string;
  readonly secretsUsernameField?: string;
  readonly secretsPasswordField?: string;
  readonly roleArn?: string;
}

interface RegistryConfig {
  readonly version: '1.0';
  readonly domainCredentials: Record<string, DomainConfig>;
}

export async function run(): Promise<void> {
  try {
    const registryHost = core.getInput('registryHost', { required: true });
    core.debug(`docker registry hostname = '${registryHost}'`);

    const secretsManagerSecretId = core.getInput('secretsManagerSecretId', { required: false }) || undefined;
    const secretsUsernameField = core.getInput('secretsUsernameField', { required: false }) || undefined;
    const secretsPasswordField = core.getInput('secretsPasswordField', { required: false }) || undefined;
    const ecrRepository = core.getInput('ecrRepository', { required: false }) || undefined;
    const roleArn = core.getInput('roleArn', { required: false }) || undefined;

    if (secretsManagerSecretId === undefined && ecrRepository === undefined) {
      throw new Error('one of secretsManagerSecretId or ecrRepository must be set');
    }
    if (secretsManagerSecretId !== undefined && ecrRepository !== undefined) {
      throw new Error('only one of secretsManagerSecretId or ecrRepository can be set');
    }
    if (secretsManagerSecretId === undefined && (secretsUsernameField !== undefined || secretsPasswordField !== undefined)) {
      throw new Error('secretsUsernameField/secretsPasswordField can only be set when secretsManagerSecretId is set');
    }

    let configFilename = process.env.CDK_DOCKER_CREDS_FILE;

    let configContents: RegistryConfig;
    if (configFilename === undefined) {
      // If CDK_DOCKER_CREDS_FILE env isnt specified, create a new file in the temp directory
      configFilename = path.join(mkdtempSync(`${tmpdir()}${path.sep}`), 'cdk-docker-creds.json');
      configContents = {
        version: '1.0',
        domainCredentials: {},
      };
    } else {
      // Read the contents of the existing CDK_DOCKER_CREDS_FILE
      configContents = JSON.parse(readFileSync(configFilename).toString());
    }

    core.debug(`config filename = '${configFilename}'`);

    if (Object.keys(configContents.domainCredentials).includes(registryHost)) {
      throw new Error(`registry ${registryHost} is already present in the configuration file`);
    }

    configContents.domainCredentials[registryHost] = {
      ecrRepository: ecrRepository !== undefined ? true : undefined,
      roleArn,
      secretsManagerSecretId,
      secretsUsernameField,
      secretsPasswordField,
    };

    core.debug(`config contents = '${JSON.stringify(configContents)}'`);

    writeFileSync(configFilename, JSON.stringify(configContents));
    core.exportVariable(configLocationEnvVar, configFilename);
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message);
  }
}