import { Injectable } from '@angular/core';
import { config, CredentialProviderChain } from 'aws-sdk/global';
import { Credentials } from 'aws-sdk/lib/core';
import { provider } from 'aws-sdk/lib/credentials/credential_provider_chain';

import { IMyCredentialsOptions } from '../interfaces/my-credentials-options';
import { KeyStore } from 'src/app/shared/classes/key-store';
import {
  KeyStoreCredentials,
  NoKeyStoreCredsError,
} from 'src/app/shared/classes/key-store-credentials';
import { LoggerService } from 'src/app/gup-common/services/logger/logger.service';

export enum AuthStatus {
  authenticated = 0,
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  static readonly apiVersions = Object.freeze({
    s3: '2006-03-01',
    sts: '2011-06-15',
  });
  private _identity?: string;
  private _credentials: KeyStoreCredentials;
  private _credProvider: CredentialProviderChain;

  get providerChain(): Array<Credentials | provider> {
    return this._credProvider.providers;
  }

  get identity(): string | undefined {
    return this._identity;
  }

  get credentialsExpire(): Date {
    return this._credentials.expireTime;
  }

  constructor(
    private readonly _logger: LoggerService,
    private readonly _keyStore: KeyStore
  ) {
    this._identity = this._keyStore.identity ?? undefined;
    this._credentials = new KeyStoreCredentials(this._keyStore);
    this._credProvider = new CredentialProviderChain([() => this._credentials]);

    config.update({
      apiVersions: AuthService.apiVersions,
      credentialProvider: this._credProvider,
    });

    this._logger.initialize('Auth', 'service', this);
    this._credentials.refresh();
  }

  deauthenticate() {
    this._credentials.clear();
  }

  async isAuthenticated(): Promise<boolean> {
    try {
      const creds = await this._credProvider.resolvePromise();
      return !creds.needsRefresh();
    } catch (exc) {
      if (!(exc instanceof NoKeyStoreCredsError)) {
        this._logger.error('Unexpected auth error', exc);
      }
      return false;
    }
  }

  addCredentials(credentials: Credentials | IMyCredentialsOptions) {
    if (credentials instanceof Credentials) {
      this._logger.debug('Shifting credentials directly into chain[0]');
      this.providerChain.unshift(credentials);
    } else {
      this._logger.debug('Storing credentials info in KeyStore');
      this._identity = credentials.identity;
      this._keyStore.identity = credentials.identity ?? null;
      this._keyStore.accessKeyId = credentials.accessKeyId ?? null;
      this._keyStore.secretKey = credentials.secretAccessKey ?? null;
      this._keyStore.sessionToken = credentials.sessionToken ?? null;
      this._keyStore.expiredTime = credentials.expireTime ?? null;
      this._credentials.refresh();
    }
  }

  addCredentialsFunction(credentialsFunct: () => Credentials) {
    this._logger.debug('Shifting credentials function directly into chain[0]');
    this.providerChain.unshift(credentialsFunct);
  }

  /**
   * What to do when we find out there are no credentials
   * (e.g. redirect to auth endpoint)
   */
  noCredentials() {
    const cb = this._credentials.noCredentialsCallback;
    if (cb) {
      cb();
    }
  }

  /**
   * Register a function to be called when there are no credentials.
   * Should be called by the service managing external auth (OAuthProvider).
   */
  setNoCredentialsCallback(cb: () => void) {
    this._credentials.noCredentialsCallback = cb;
  }

  checkForCredentialsError(err: Error) {
    if (err instanceof Error) {
      if (
        ['InvalidAccessKeyId', 'ExpiredToken'].includes(err.name) ||
        (err.name === 'NotAuthorizedException' &&
          err.message.includes('expired'))
      ) {
        this._logger.warn('Credentials expired with error', err.name, [err]);
        this.noCredentials();
      }
    }
  }
}
