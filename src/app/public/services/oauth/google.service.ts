import { Injectable } from '@angular/core';
import { OAuthProvider } from './oauth-provider.interface';

import { KeyStore } from 'src/app/shared/classes/key-store';
import { bufferToHex } from 'src/app/shared/utils/transform-data';
import { IEnvConfigService } from '../env-config/env-config.interface';
import { BehaviorSubject } from 'rxjs';
import { ReadyState } from 'src/app/shared/classes/readyable';

interface IGoogleOAuthResponse {
  // access_token: string;
  code: string;
  // token_type: 'Bearer';
  // expires_in: string;
  state: string;
  scope: string;
  authuser?: string;
  hd?: string;
  prompt?: string;
  error?: never;
}

interface IGoogleOAuthError {
  error: string;
}

type EitherResponse = IGoogleOAuthResponse | IGoogleOAuthError;

const STATE_BYTELEN = 256 / 8;

@Injectable({
  providedIn: 'root',
})
export class GoogleService extends OAuthProvider {
  private readonly _crypto = crypto;

  readonly name = 'Google';
  readonly iconSrc = 'https://developers.google.com/identity/images/g-logo.png';

  endpoint = 'https://accounts.google.com/o/oauth2/v2/auth';
  clientId = '';
  hd?: string;
  readonly responseType = 'code';
  readonly scope = 'openid email';

  readonly ReadyConditions = [this.valid, this._envConfig];

  readonly valid = new BehaviorSubject(ReadyState.Init);

  lastCallback?: EitherResponse = undefined;

  /**
   * Gets the stored state value, or generates/stores/gets a new one.
   */
  get state() {
    return this._keyStore.oauthState ?? this.generateNewState();
  }

  get additionalParams() {
    return {
      hd: this.hd,
      prompt: 'select_account',
    };
  }

  constructor(
    private readonly _keyStore: KeyStore,
    private readonly _envConfig: IEnvConfigService
  ) {
    super();
    throw new Error('GoogleService not yet implemented');
    this._envConfig.env.subscribe((e) => {
      this.endpoint = e.oauth.endpoint;
      this.clientId = e.oauth.clientId;
      this.hd = e.GOOGLE_HD;

      this.valid.next(
        [this.endpoint, this.clientId, this.redirectUri].every(Boolean)
          ? ReadyState.Ready
          : ReadyState.Failed
      );
      this.valid.complete();
    });
    this.readyInit();
  }

  async parseOAuthCallback(params: EitherResponse): Promise<boolean> {
    console.debug('parseOAuthCallback', params);
    this.lastCallback = params;

    if ('error' in params) {
      return this._handleGoogleError(params.error ?? 'unknown');
    }

    if (params.state !== this.state) {
      return this._handleError('State mismatch/missing');
    }
    if (this.hd && params.hd !== this.hd) {
      return this._handleError('HD mismatch/missing');
    }

    const code = params.code;
    const result = await fetch('https://oauth2.googleapis.com/token', {});

    // this._keyStore.accessToken
    // TODO: need anything else with the auth result?
    return true;
  }

  /**
   * Generate, store, and return a new 256-bit random state.
   */
  generateNewState() {
    return (this._keyStore.oauthState = bufferToHex(
      this._crypto.getRandomValues(new Uint8Array(STATE_BYTELEN))
    ));
  }

  updateIdToken() {
    return null;
  }
  updateAccessToken() {
    return null;
  }

  private _handleGoogleError(error: string | null): Promise<false> {
    return this._handleError(`Received OAuth2 error from Google: ${error}`);
  }

  private async _handleError(description: string): Promise<false> {
    console.warn(description);
    return false;
  }
}
