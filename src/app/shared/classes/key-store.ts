const _keys = Object.freeze({
  // aws auth keys
  accessKeyId: 'gup:AWSAccessKeyId',
  secretKey: 'gup:Key',
  sessionToken: 'gup:sessionToken',
  expiredTime: 'gup:expiryTime',
  // oauth keys
  idToken: 'gup:OAuthIdToken',
  accessToken: 'gup:OAuthAccessToken',
  oauthState: 'gup:OAuthState',
  // misc
  identity: 'gup:Identity',
});

function _lsExists() {
  const test = '_T';
  try {
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (e) {
    return false;
  }
}

export class KeyStore {
  static readonly keys = Object.freeze([
    'identity',
    'accessKeyId',
    'secretKey',
    'accessToken',
    'sessionToken',
    'expiredTime',
    'idToken',
    'oauthState',
  ] as const);

  private readonly _storage: Storage = localStorage;
  private readonly _sessionStorage: Storage = sessionStorage;

  /**
   * Human-readable identity of the user, e.g. their email.
   */
  get identity(): string | null {
    return this._getter(_keys.identity);
  }
  set identity(value: string | null) {
    this._setter(_keys.identity, value);
  }

  /**
   * AWS access key ID (in base64).
   */
  get accessKeyId(): string | null {
    return this._getter(_keys.accessKeyId);
  }
  set accessKeyId(value: string | null) {
    this._setter(_keys.accessKeyId, value);
  }

  /**
   * The secret access key (in base64) correlating to `accessKeyId`.
   */
  get secretKey() {
    return this._getter(_keys.secretKey);
  }
  set secretKey(value: string | null) {
    this._setter(_keys.secretKey, value);
  }

  /**
   * AWS token expiration time
   */
  get expiredTime() {
    const value = this._getter(_keys.expiredTime);
    return value === null ? null : new Date(value);
  }
  set expiredTime(value: Date | null) {
    this._setter(
      _keys.expiredTime,
      value === null ? null : value.toISOString()
    );
  }

  /**
   * AWS ID token
   */
  get idToken(): string | null {
    return this._getter(_keys.idToken);
  }
  set idToken(value: string | null) {
    this._setter(_keys.idToken, value);
  }

  /**
   * AWS access token
   */
  get accessToken(): string | null {
    return this._getter(_keys.accessToken);
  }
  set accessToken(value: string | null) {
    this._setter(_keys.accessToken, value);
  }

  get sessionToken(): string | null {
    return this._getter(_keys.sessionToken);
  }
  set sessionToken(value: string | null) {
    this._setter(_keys.sessionToken, value);
  }

  get oauthState(): string | null {
    return this._sessionStorage.getItem(_keys.oauthState);
  }
  set oauthState(value: string | null) {
    if (value) {
      this._sessionStorage.setItem(_keys.oauthState, value);
    } else {
      this._sessionStorage.removeItem(_keys.oauthState);
    }
  }

  constructor() {
    if (!_lsExists()) {
      console.warn('LocalStorage unavailable, falling back to SessionStorage');
      this._storage = sessionStorage;
    }
  }

  /**
   * Clear our store values without clearing the *whole* Storage.
   */
  clear() {
    for (const key of KeyStore.keys) {
      this[key] = null;
    }
  }

  private _getter(key: string): string | null {
    return this._storage.getItem(key);
  }
  private _setter(key: string, value?: string | null) {
    if (typeof value === 'string') {
      this._storage.setItem(key, value);
    } else {
      this._storage.removeItem(key);
    }
  }
}
