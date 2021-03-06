import { Injectable } from '@angular/core';
import { ReplaySubject, of, BehaviorSubject } from 'rxjs';

import { EnvConfigValidationError } from './env-config-validation-error';
import { IEnvConfigService, IEnv } from './env-config.interface';
import { ReadyState } from 'src/app/shared/classes/readyable';
import { LoggerService } from 'src/app/gup-common/services/logger/logger.service';

const _roleArnRE = /^arn:aws:iam:[a-z0-9-]*:\d+:role\/[A-Za-z+=,\.@_/-]+$/;

@Injectable({
  providedIn: 'root',
})
export class EnvConfigService extends IEnvConfigService {
  private readonly _env = new ReplaySubject<Readonly<IEnv>>(1);
  private readonly _envValid = new BehaviorSubject(ReadyState.Init);
  readonly ReadyConditions = [this._envValid];

  get env() {
    return this._env.asObservable();
  }

  constructor(private readonly _logger: LoggerService) {
    super();
    this._logger.initialize('EnvConfig', 'service', this);

    this.readyInit();
    this._load();
  }

  /**
   * Loads `./env.json`, validates its contents, and emits them to `_env`/`env`.
   * @returns {boolean} if the network call was successful
   * @throws {EnvConfigValidationError} if there's a validation error.
   * @throws {SyntaxError} if `env.json` is not JSON.
   */
  private async _load(): Promise<boolean> {
    const resp = await fetch('./env.json');

    if (resp.ok) {
      try {
        const envData = await resp.json();
        const validatedData = this.validate(envData);
        this._env.next(validatedData);
        this._envValid.next(ReadyState.Ready);
        this._envValid.complete();
      } catch (exc) {
        this._envValid.next(ReadyState.Failed);
        this._envValid.complete();
        throw exc;
      }
    } else {
      this._logger.error('load config failed:', resp);
      this._envValid.next(ReadyState.Failed);
      this._envValid.complete();
    }

    return resp.ok;
  }

  validate(env: IEnv): Readonly<IEnv> {
    // validate awsRoleArn
    if (!env.awsRoleArn) {
      env.awsRoleArn = undefined;
    } else if (env.awsRoleArn.match(_roleArnRE)) {
      throw new EnvConfigValidationError(['awsRoleArn'], [env.awsRoleArn], '');
    }

    // validate aws*Pool
    if (!env.awsIdentityRegion || !env.awsIdentityGuid) {
      throw new EnvConfigValidationError(
        ['awsIdentityRegion', 'awsIdentityGuid'],
        [env.awsIdentityRegion, env.awsIdentityGuid],
        ''
      );
    }
    // env.awsIdentityPool = `${env.awsIdentityRegion}:${env.awsIdentityGuid}`;
    // if (!env.awsUserPoolSuffix) {
    //   throw new EnvConfigValidationError(
    //     ['awsUserPoolSuffix'],
    //     [env.awsUserPoolSuffix],
    //     ''
    //   );
    // }
    // env.awsUserPool = `${env.awsIdentityRegion}_${env.awsUserPoolSuffix}`;

    // validate oauth
    const oauthKeys = ['endpoint', 'clientId'] as const;
    if (!env.oauth || !oauthKeys.every((p) => env.oauth[p]?.length)) {
      throw new EnvConfigValidationError(['oauth'], [env.oauth], '');
    }
    env.oauth = Object.freeze(env.oauth);

    // validate awsS3*
    if (!env.awsS3EndpointARN) {
      throw new EnvConfigValidationError(
        ['awsS3EndpointARN'],
        [env.awsS3EndpointARN],
        ''
      );
    }
    if (!['string', 'undefined'].includes(typeof env.awsS3Prefix)) {
      throw new EnvConfigValidationError(
        ['awsS3Prefix'],
        [env.awsS3Prefix],
        ''
      );
    }

    // validate site stuff
    if (env.publicRoot !== undefined && typeof env.publicRoot !== 'string') {
      throw new EnvConfigValidationError(
        ['publicRoot'],
        [env.publicRoot],
        'must be a string or omitted'
      );
    }
    if (!env.siteName) {
      throw new EnvConfigValidationError(
        ['siteName'],
        [env.siteName],
        'must be a string'
      );
    }

    this._logger.log('Parsed and validated env:', env);
    return Object.freeze(env);
  }
}
