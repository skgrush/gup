import { Injectable } from '@angular/core';
import * as CognitoIdentity from 'aws-sdk/clients/cognitoidentity';
import { BehaviorSubject } from 'rxjs';

import { OAuthProvider } from './oauth-provider.interface';
import { KeyStore } from 'src/app/shared/classes/key-store';
import { IEnvConfigService } from '../env-config/env-config.interface';
import { ApiAuthService } from '../api/api-auth.service';
import { AuthService } from '../auth.service';
import { ReadyState } from 'src/app/shared/classes/readyable';
import {
  CognitoJwt,
  IIdJWTJson,
  IAuthJWTJson,
} from 'src/app/shared/classes/cognito-jwt';
import { LoggerService } from 'src/app/gup-common/services/logger/logger.service';

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
  readonly responseType = 'token';
  readonly scope = 'email openid aws.cognito.signin.user.admin';
  readonly state = undefined;
  readonly additionalParams = undefined;

  readonly valid = new BehaviorSubject(ReadyState.Init);

  readonly ReadyConditions = [this.valid, this._envConfig, this._apiAuth];

  lastCallback?: EitherResponse;

  approximateExpiration?: Date;

  private _envPoolRegion = '';
  private _envUserPool = '';
  private _envIdentityPool = '';

  constructor(
    private readonly _keyStore: KeyStore,
    private readonly _envConfig: IEnvConfigService,
    private readonly _apiAuth: ApiAuthService,
    private readonly _auth: AuthService,
    private readonly _logger: LoggerService
  ) {
    super();
    this._logger.initialize('Cognito', 'service', this);
    this._envConfig.env.subscribe((e) => {
      this.endpoint = e.oauth.endpoint;
      this.clientId = e.oauth.clientId;
      if (e.oauth.redirectUri) {
        (this.redirectUri as any) = e.oauth.redirectUri;
      }
      this._envPoolRegion = e.awsIdentityRegion;
      this._envUserPool = e.awsUserPool;
      this._envIdentityPool = e.awsIdentityPool;

      this.valid.next(
        this.endpoint && this.clientId ? ReadyState.Ready : ReadyState.Failed
      );
      this.valid.complete();
    });
    this.readyInit();

    this._auth.setNoCredentialsCallback(this.navigateToProvider.bind(this));
  }

  generateNewState() {
    return undefined;
  }

  async parseOAuthCallback(params: EitherResponse): Promise<boolean> {
    this.readyOrThrow();

    this._logger.debug('parseOAuthCallback', params);
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

    const expiresIn = +params.expires_in;
    this.approximateExpiration = new Date(Date.now() + expiresIn * 1e3);
    this._keyStore.idToken = params.id_token;
    this._keyStore.accessToken = params.access_token;

    this.oauthIdJWT = this.updateIdToken(params.id_token);
    this.oauthAccessJWT = this.updateAccessToken(params.access_token);

    const provider = `cognito-idp.${this._envPoolRegion}.amazonaws.com/${this._envUserPool}`;
    const logins = {
      [provider]: this.oauthIdJWT.rawJWT,
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

    this._auth.addCredentials({
      identity: this.oauthIdJWT.email,
      accessKeyId: credentials.AccessKeyId,
      secretAccessKey: credentials.SecretKey,
      sessionToken: credentials.SessionToken,
      expireTime: credentials.Expiration,
    });

    return true;
  }

  /**
   * Parse the token, update and return `this.oauthIdJWT`.
   */
  updateIdToken(idToken: string): CognitoJwt<IIdJWTJson>;
  updateIdToken(idToken?: undefined): CognitoJwt<IIdJWTJson> | null;
  updateIdToken(idToken?: string) {
    if (!idToken) {
      idToken = this._keyStore.idToken ?? undefined;
      if (!idToken) {
        return null;
      }
    }
    return (this.oauthIdJWT = new CognitoJwt(idToken));
  }

  /**
   * Parse the token, update and return `this.oauthAccessJWT`.
   */
  updateAccessToken(authToken: string): CognitoJwt<IAuthJWTJson>;
  updateAccessToken(authToken?: undefined): CognitoJwt<IAuthJWTJson> | null;
  updateAccessToken(authToken?: string) {
    if (!authToken) {
      authToken = this._keyStore.accessToken ?? undefined;
      if (!authToken) {
        return null;
      }
    }
    return (this.oauthAccessJWT = new CognitoJwt(authToken));
  }

  private _handleErrorCode(params: ICognitoOAuthError): Promise<false> {
    return this._handleError(
      `Received OAuth2 error from Cognito: ${params.error}`
    );
  }

  private async _handleError(warning: string, errObj?: Error): Promise<false> {
    if (errObj) {
      this._logger.error(warning, errObj);
    } else {
      this._logger.warn(warning);
    }
    return false;
  }
}
