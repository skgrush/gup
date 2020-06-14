interface IBaseJWTJson {
  /** "Time when the End-User authentication occurred" in Unix sec */
  auth_time: number;
  /** Expiration time in Unix sec */
  exp: number;
  /** JWT issued-time in Unix sec */
  iat: number;
  /**
   * Issuer identifier
   * `https://cognito-idp.${env.awsIdentifyRegion}.amazonaws.com/${env.awsIdentifyRegion}_${env.awsUserPoolSuffix}`
   */
  iss: string;
  token_use: string;

  /** Cognito Subject UUID */
  sub: string;

  ['cognito:groups']: string[];
}

export interface IIdJWTJson extends IBaseJWTJson {
  /** Access Token hash */
  at_hash: string;
  /** OAuth audience (env.oauth.clientId) */
  aud: string;
  email: string;
  token_use: 'id';
  /** `${providerName.toLowerCase()}_${userId}` */
  ['cognito:username']: string;
  identities: Array<{
    dateCreated: string;
    issuer: null;
    primary: 'true' | 'false';
    providerName: 'Google' | string;
    providerType: 'Google' | string;
    userId: string;
  }>;
}

export interface IAuthJWTJson extends IBaseJWTJson {
  /** env.oauth.clientId, aka "aud" */
  client_id: string;
  /** ?????? */
  jti: string;
  /** OAuth/token scopes */
  scope: string;
  token_use: 'access';
  /** equal to ['cognito:username'] */
  username: string;
  version: number;
}

type _Picker<T, A, B> = T extends IIdJWTJson
  ? A
  : T extends IAuthJWTJson
  ? B
  : never;

type _IEitherJWTJson = IIdJWTJson | IAuthJWTJson;

export class CognitoJwt<T extends _IEitherJWTJson> {
  readonly tokenUse: _Picker<T, 'id', 'access'>;

  readonly email: _Picker<T, string, undefined>;
  readonly scope: _Picker<T, undefined, string>;
  readonly authTime: Date;
  readonly expireTime: Date;
  readonly issueTime: Date;
  readonly audience: string;
  readonly subject: string;
  readonly issuer: string;
  readonly cognitoUsername: string;

  readonly _parsedResult: T;

  constructor(readonly rawJWT: string) {
    const parsed = this._parseRawToObject();
    this._parsedResult = parsed;

    this.authTime = new Date(parsed.auth_time * 1000);
    this.expireTime = new Date(parsed.exp * 1000);
    this.issueTime = new Date(parsed.iat * 1000);
    this.subject = parsed.sub;
    this.issuer = parsed.iss;

    if (parsed.token_use === 'id') {
      const parsedT = parsed as IIdJWTJson;
      this.tokenUse = 'id' as any;
      this.cognitoUsername = parsedT['cognito:username'];
      this.audience = parsedT.aud;
      this.email = parsedT.email as any;
      this.scope = undefined as any;
    } else if (parsed.token_use === 'access') {
      const parsedT = parsed as IAuthJWTJson;
      this.tokenUse = parsedT.token_use as any;
      this.cognitoUsername = parsedT.username;
      this.audience = parsedT.client_id;
      this.email = undefined as any;
      this.scope = parsedT.scope as any;
    } else {
      throw new Error(`Unexpected token_use value '${parsed.token_use}'`);
    }
  }

  private _parseRawToObject() {
    const payloadB64 = this.rawJWT.split('.')[1];
    if (!payloadB64) {
      throw new Error('Failed to get payload from raw JWT');
    }
    return JSON.parse(atob(payloadB64)) as T;
  }
}
