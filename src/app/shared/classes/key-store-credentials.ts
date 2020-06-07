import { KeyStore } from './key-store';
import { Credentials } from 'aws-sdk/lib/core';

export class NoKeyStoreCredsError extends Error {
  readonly name = 'NoKeyStoreCredsError';
  constructor(...params: any[]) {
    super();
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, NoKeyStoreCredsError);
    }
  }
}

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

  clear() {
    this.accessKeyId = this.secretAccessKey = this.sessionToken = '';
    this.keyStore.clear();
    this.expireTime = new Date(Date.now() - 1e4);
    this.expired = true;
  }

  private _expired() {
    return this.expireTime ? this.expireTime.getTime() < Date.now() : true;
  }

  refresh(callback = (err?: any) => {}) {
    (this as any).coalesceRefresh(callback);
  }

  load(callback: (err?: any) => void) {
    const { accessKeyId, secretKey, sessionToken, expiredTime } = this.keyStore;

    if (accessKeyId && secretKey && expiredTime) {
      this.accessKeyId = accessKeyId;
      this.secretAccessKey = secretKey;
      this.sessionToken = sessionToken ?? this.sessionToken;
      this.expireTime = expiredTime;
      this.expired = this._expired();

      callback();
    } else {
      callback(new NoKeyStoreCredsError('No credentials stored'));
      // if (this.noCredentialsCallback) {
      //   this.noCredentialsCallback();
      // }
    }
  }
}
