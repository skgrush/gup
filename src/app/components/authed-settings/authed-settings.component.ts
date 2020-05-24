import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';
import { ApiAuthService } from 'src/app/services/api/api-auth.service';
import { OAuthProvider } from 'src/app/services/oauth/oauth-provider.interface';
import { IEnvConfigService } from 'src/app/services/env-config/env-config.interface';
import { Readyable, ReadyState } from 'src/app/classes/readyable';
import {
  TotpQrPopupComponent,
  IConfirmGood,
} from '../totp-qr-popup/totp-qr-popup.component';

@Component({
  selector: 'gup-authed-settings',
  templateUrl: './authed-settings.component.html',
  styleUrls: ['./authed-settings.component.scss'],
})
export class AuthedSettingsComponent extends Readyable implements OnInit {
  readonly ReadyConditions = [this.oauth, this.apiAuth, this.envConfig];
  get isOpen() {
    return this._isOpen ? true : null;
  }

  get allowMFASetup() {
    return this.oauth.oauthAccessJWT && !this._hasMFA;
  }

  private _isOpen = false;
  private _hasMFA?: boolean;

  doingMfaSetup = false;
  mfaSecret?: string;
  mfaIssuer?: string;
  mfaAccountName?: string;

  @ViewChild('mfaPopup')
  mfaPopup?: TotpQrPopupComponent;

  constructor(
    readonly auth: AuthService,
    readonly oauth: OAuthProvider,
    readonly router: Router,
    readonly apiAuth: ApiAuthService,
    readonly envConfig: IEnvConfigService
  ) {
    super();

    this.readyInit();

    this.envConfig.env.subscribe((env) => {
      this.mfaIssuer = env.siteName;
    });
  }

  ngOnInit(): void {
    this.oauth.updateAccessToken();
    this.mfaAccountName = this.auth.identity;
  }

  open() {
    this._isOpen = true;
  }

  close() {
    this._isOpen = false;
  }

  logout() {
    this.router.navigate(['/logout']);
  }

  async confirmMFASetup(confirm: IConfirmGood | null) {
    const accessToken = this.oauth.oauthAccessJWT?.rawJWT;
    if (!accessToken) {
      throw new Error('Missing AccessToken');
    }
    if (!this.doingMfaSetup) {
      throw new Error('confirmMFASetup called out of order');
    }

    try {
      if (confirm && confirm.confirmCode) {
        const { deviceName, confirmCode } = confirm;

        const success = await this.apiAuth.verifySoftwareToken({
          deviceName,
          code: confirmCode,
          accessToken,
        });

        if (success) {
          this._hasMFA = true;
        }
      }
    } catch (exc) {
      this.auth.checkForCredentialsError(exc);
      throw exc;
    } finally {
      // neutral resets
      this.doingMfaSetup = false;
      this.mfaSecret = undefined;
    }
  }

  async doMFASetup() {
    this.readyOrThrow();
    const accessToken = this.oauth.oauthAccessJWT?.rawJWT;

    if (!this.mfaPopup) {
      throw new Error('no MFA popup');
    }
    if (!accessToken) {
      throw new Error('Missing AccessToken');
    }
    if (this.doingMfaSetup) {
      console.warn('Already doing MFA setup!');
      return;
    }

    try {
      const result = await this.apiAuth.associateSoftwareToken({
        AccessToken: accessToken,
      });

      this.doingMfaSetup = true;
      this.mfaSecret = result.SecretCode;
    } catch (exc) {
      this.doingMfaSetup = false;
      this.auth.checkForCredentialsError(exc);
      throw exc;
    }
  }
}