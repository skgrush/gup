import { Injectable } from '@angular/core';
import { CognitoIdentity } from 'aws-sdk/clients/all';
import { BehaviorSubject } from 'rxjs';

import { OAuthProvider } from './oauth-provider.interface';
import { KeyStore } from '../../classes/key-store';
import { IEnvConfigService } from '../env-config/env-config.interface';
import { ApiAuthService } from '../api-auth.service';
import { AuthService } from '../auth.service';
import { ReadyState } from '../../classes/readyable';

interface ICognitoOAuthResponse {
  /** JWT from Cognito */
  access_token: string;
  /** The identification token to pass to get a Cognito ID GUID with */
  id_token: string;
  token_type: 'Bearer';

  /** lifetime in seconds */
  expires_in: number;
}

interface ICognitoOAuthError {
  error: string;
}

type EitherResponse = ICognitoOAuthResponse | ICognitoOAuthError;

@Injectable({
  providedIn: 'root',
})
export class CognitoService extends OAuthProvider {
  readonly name = 'Cognito';
  readonly iconSrc = undefined;

  // oauth parameters
  endpoint = '';
  clientId = '';
  redirectUri = '';
  readonly responseType = 'token';
  readonly scope = 'email openid';
  readonly state = undefined;
  readonly additionalParams = undefined;

  readonly valid = new BehaviorSubject(ReadyState.Init);

  readonly ReadyConditions = [this.valid, this._envConfig, this._apiAuth];

  lastCallback?: EitherResponse;

  oauthIdJWT?: string;
  approximateExpiration?: Date;

  private _envPoolRegion = '';
  private _envUserPool = '';
  private _envIdentityPool = '';

  constructor(
    private readonly _keyStore: KeyStore,
    private readonly _envConfig: IEnvConfigService,
    private readonly _apiAuth: ApiAuthService,
    private readonly _auth: AuthService
  ) {
    super();
    console.warn('CognitoService:', this);
    this._envConfig.env.subscribe((e) => {
      this.endpoint = e.oauth.endpoint;
      this.clientId = e.oauth.clientId;
      this.redirectUri = e.oauth.redirectUri;
      this._envPoolRegion = e.awsIdentityRegion;
      this._envUserPool = e.awsUserPool;
      this._envIdentityPool = e.awsIdentityPool;

      this.valid.next(
        this.endpoint && this.clientId && this.redirectUri
          ? ReadyState.Ready
          : ReadyState.Failed
      );
      this.valid.complete();
    });
    this.readyInit();
  }

  generateNewState() {
    return undefined;
  }

  async parseOAuthCallback(params: EitherResponse): Promise<boolean> {
    this.readyOrThrow();

    console.debug('parseOAuthCallback', params);
    this.lastCallback = params;

    if ('error' in params) {
      this.oauthIdJWT = undefined;
      this.approximateExpiration = undefined;
      this._keyStore.idToken = null;
      return this._handleErrorCode(params);
    }
    if (params.token_type !== 'Bearer') {
      return this._handleError(
        `Unexpected token_type from Cognito: ${params.token_type}, expected 'Bearer'`
      );
    }

    this.oauthIdJWT = params.id_token;
    const expiresIn = +params.expires_in;
    this.approximateExpiration = new Date(Date.now() + expiresIn * 1e3);
    this._keyStore.idToken = params.id_token;

    // cognito-idp.us-east-2.amazonaws.com/us-east-2_8M4Ux7UmM
    const provider = `cognito-idp.${this._envPoolRegion}.amazonaws.com/${this._envUserPool}`;
    const logins = {
      [provider]: this.oauthIdJWT,
    };

    let credentials: CognitoIdentity.Credentials;
    try {
      credentials = await this._apiAuth.getCredentialsFromLogins(
        this._envIdentityPool,
        logins
      );
    } catch (exc) {
      return this._handleError('Error in getId/getCredentials:', exc);
    }

    this._auth.update({
      accessKeyId: credentials.AccessKeyId,
      secretKey: credentials.SecretKey,
      sessionToken: credentials.SessionToken,
    });

    console.debug('new credentials:', credentials);

    return true;
  }

  private _handleErrorCode(params: ICognitoOAuthError): Promise<false> {
    return this._handleError(
      `Received OAuth2 error from Cognito: ${params.error}`
    );
  }

  private async _handleError(warning: string, errObj?: Error): Promise<false> {
    if (errObj) {
      console.error(warning, errObj);
    } else {
      console.warn(warning);
    }
    return false;
  }
}
