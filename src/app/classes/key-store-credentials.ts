import { KeyStore } from './key-store';
import { Credentials } from 'aws-sdk/lib/core';

export class KeyStoreCredentials extends Credentials {
  /**
   * Called if we determine we can't find credentials.
   */
  noCredentialsCallback?: () => void;

  constructor(
    readonly keyStore: KeyStore,
    sessionToken?: string,
    noCredsCallback?: () => void
  ) {
    super(
      keyStore.accessKeyId as string,
      keyStore.secretKey as string,
      sessionToken
    );
    this.noCredentialsCallback = noCredsCallback;

    const { expiredTime } = keyStore;
    if (expiredTime) {
      this.expireTime = expiredTime;
    }
    this.expired = this._expired();
  }

  private _expired() {
    return this.expireTime ? this.expireTime.getTime() < Date.now() : true;
  }

  refresh(callback = (err?: any) => {}) {
    (this as any).coalesceRefresh(callback);
  }

  load(callback: (err?: any) => void) {
    console.warn('key-store-credentials LOAD');
    const { accessKeyId, secretKey, sessionToken, expiredTime } = this.keyStore;

    if (accessKeyId && secretKey && expiredTime) {
      this.accessKeyId = accessKeyId;
      this.secretAccessKey = secretKey;
      this.sessionToken = sessionToken ?? this.sessionToken;
      this.expireTime = expiredTime;
      this.expired = this._expired();

      callback();
    } else {
      callback(new Error('No credentials stored'));
      if (this.noCredentialsCallback) {
        this.noCredentialsCallback();
      }
    }
  }
}
