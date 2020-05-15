interface IJWTJson {
  /** Access Token hash */
  at_hash: string;
  /** OAuth audience (env.oauth.clientId) */
  aud: string;
  email: string;
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
  /** Cognito Subject UUID */
  sub: string;
  token_use: 'id';
  ['cognito:groups']: string[];
  ['cognito:username']: string;
  identities: Array<{
    dateCreated: string;
    issuer: null;
    primary: 'true' | 'false';
    providerName: 'Google' | string;
    providerType: 'Google' | string;
  }>;
}

export class CognitoJwt {
  readonly email: string;
  readonly authTime: Date;
  readonly expireTime: Date;
  readonly issueTime: Date;
  readonly subject: string;
  readonly cognitoUsername: string;

  constructor(readonly rawJWT: string) {
    const parsed = this._parseRawToObject();

    this.email = parsed.email;
    this.authTime = new Date(parsed.auth_time * 1000);
    this.expireTime = new Date(parsed.exp * 1000);
    this.issueTime = new Date(parsed.iat * 1000);
    this.subject = parsed.sub;
    this.cognitoUsername = parsed['cognito:username'];
  }

  private _parseRawToObject() {
    const payloadB64 = this.rawJWT.split('.')[1];
    if (!payloadB64) {
      throw new Error('Failed to get payload from raw JWT');
    }
    return JSON.parse(atob(payloadB64)) as IJWTJson;
  }
}
