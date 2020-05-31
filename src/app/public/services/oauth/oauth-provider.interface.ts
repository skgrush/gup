import { BehaviorSubject } from 'rxjs';
import { Readyable, ReadyState } from 'src/app/shared/classes/readyable';
import {
  CognitoJwt,
  IIdJWTJson,
  IAuthJWTJson,
} from 'src/app/shared/classes/cognito-jwt';

/**
 * Abstract baseclass for OAuth2 providers.
 */
export abstract class OAuthProvider extends Readyable {
  /** User-facing name of the provider */
  abstract readonly name: string;
  /** User-facing icon to display. */
  abstract readonly iconSrc?: string;
  /** OAuth2 endpoint URL. */
  abstract readonly endpoint: string;
  /** `response_type` parameter for the endpoint. */
  abstract readonly responseType: 'code' | 'token';
  /** `client_id` parameter for the endpoint. */
  abstract readonly clientId: string;
  /** `redirect_uri` parameter for the endpoint.  */
  readonly redirectUri = `${document.baseURI}?path=/authed`;

  abstract readonly scope: string;
  abstract readonly state?: string;

  abstract readonly additionalParams?: Readonly<any>;

  oauthIdJWT?: CognitoJwt<IIdJWTJson>;
  oauthAccessJWT?: CognitoJwt<IAuthJWTJson>;
  abstract lastCallback?: any;

  abstract valid: BehaviorSubject<ReadyState>;

  abstract parseOAuthCallback(arg: any): Promise<boolean>;

  abstract generateNewState(): string | undefined;

  abstract updateIdToken(): CognitoJwt<IIdJWTJson> | null;
  abstract updateAccessToken(): CognitoJwt<IAuthJWTJson> | null;

  navigateToProvider() {
    const params = new URLSearchParams(this.additionalParams);
    params.set('client_id', this.clientId);
    params.set('redirect_uri', this.redirectUri);
    params.set('response_type', this.responseType);
    params.set('scope', this.scope);
    if (this.state) {
      params.set('state', this.state);
    }

    window.location.assign(`${this.endpoint}?${params}`);
  }
}
