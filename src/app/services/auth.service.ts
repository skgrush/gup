import { Injectable } from '@angular/core';
import { KeyStore } from '../classes/key-store';

import { config, Credentials } from 'aws-sdk/global';

export enum AuthStatus {
  authenticated = 0,
}

interface IProps {
  accessKeyId?: string;
  secretKey?: string;
  sessionToken?: string;
  bucket?: string;
  region?: string;
  credentials?: Credentials;
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
  private _credentials?: Credentials;
  private _region?: string;

  constructor() {
    config.update({
      apiVersions: AuthService.apiVersions,
    });

    const { accessKeyId, secretKey, sessionToken } = this._keyStore;
    if (accessKeyId && secretKey && sessionToken) {
      this.update({ accessKeyId, secretKey, sessionToken });
    }
  }

  isAuthenticated(): boolean {
    return (this._credentials && !this._credentials.needsRefresh()) ?? false;
  }

  update(props: IProps) {
    if (props.credentials) {
      this._credentials = props.credentials;
      props.accessKeyId = props.credentials.accessKeyId;
      props.secretKey = props.credentials.secretAccessKey;
      props.sessionToken = props.credentials.sessionToken ?? props.sessionToken;
    }

    if (props.accessKeyId) {
      this._keyStore.accessKeyId = props.accessKeyId;
    }
    if (props.secretKey) {
      this._keyStore.secretKey = props.secretKey;
    }
    if (props.sessionToken) {
      this._keyStore.sessionToken = props.sessionToken;
    }
    if (props.region) {
      this._region = props.region;
    }

    const credentialsChanged =
      props.accessKeyId || props.secretKey || props.sessionToken;
    if (props.region || credentialsChanged) {
      // something we store in config has changed
      const region = this._region;
      const { accessKeyId, secretKey, sessionToken } = this._keyStore;

      if (credentialsChanged && !props.credentials) {
        // credentials have changed
        if (accessKeyId && secretKey) {
          // credentials are ready
          this._credentials = new Credentials(
            accessKeyId,
            secretKey,
            sessionToken ?? undefined
          );
        } else {
          this._credentials = undefined;
        }
      }

      config.update({
        credentials: this._credentials,
        region,
      });
    }
  }

  async getCredentials(): Promise<boolean | null> {
    if (!this._credentials) {
      return null;
    }

    try {
      await this._credentials.getPromise();
      return true;
    } catch (err) {
      console.error('getCredentials:', err);
      return false;
    }
  }
}
