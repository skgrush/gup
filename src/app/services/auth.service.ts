import { Injectable } from '@angular/core';
import { config, CredentialProviderChain } from 'aws-sdk/global';
import { Credentials } from 'aws-sdk/lib/core';

import { IMyCredentialsOptions } from '../interfaces/my-credentials-options';
import { KeyStore } from '../classes/key-store';
import { KeyStoreCredentials } from '../classes/key-store-credentials';
import { provider } from 'aws-sdk/lib/credentials/credential_provider_chain';

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
  private readonly _keyStore = new KeyStore();
  private _credentials: KeyStoreCredentials;
  private _credProvider: CredentialProviderChain;

  get providerChain(): Array<Credentials | provider> {
    return this._credProvider.providers;
  }

  constructor() {
    this._credentials = new KeyStoreCredentials(this._keyStore);
    this._credProvider = new CredentialProviderChain([() => this._credentials]);

    config.update({
      apiVersions: AuthService.apiVersions,
      credentialProvider: this._credProvider,
    });

    console.warn('authService', this);
    this._credentials.refresh();
  }

  async isAuthenticated(): Promise<boolean> {
    const creds = await this._credProvider.resolvePromise();
    return creds.needsRefresh();
  }

  addCredentials(credentials: Credentials | IMyCredentialsOptions) {
    if (credentials instanceof Credentials) {
      console.debug('Shifting credentials directly into chain[0]');
      this.providerChain.unshift(credentials);
    } else {
      console.debug('Storing credentials info in KeyStore');
      this._keyStore.accessKeyId = credentials.accessKeyId ?? null;
      this._keyStore.secretKey = credentials.secretAccessKey ?? null;
      this._keyStore.sessionToken = credentials.sessionToken ?? null;
      this._keyStore.expiredTime = credentials.expireTime ?? null;
      this._credentials.refresh();
    }
  }

  addCredentialsFunction(credentialsFunct: () => Credentials) {
    console.debug('Shifting credentials function directly into chain[0]');
    this.providerChain.unshift(credentialsFunct);
  }

  noCredentials() {
    const cb = this._credentials.noCredentialsCallback;
    if (cb) {
      cb();
    }
  }

  setNoCredentialsCallback(cb: () => void) {
    this._credentials.noCredentialsCallback = cb;
  }
}
