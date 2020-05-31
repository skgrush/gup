import { Component } from '@angular/core';
import { OAuthProvider } from '../../services/oauth/oauth-provider.interface';
import { ReadyState } from 'src/app/shared/classes/readyable';

@Component({
  selector: 'gup-oauth',
  templateUrl: './oauth.component.html',
  styleUrls: ['./oauth.component.scss'],
})
export class OauthComponent {
  get additionalParams() {
    if (!this.oauthService.additionalParams) {
      return [];
    }
    return Object.entries(this.oauthService.additionalParams);
  }

  ready = false;

  constructor(readonly oauthService: OAuthProvider) {
    oauthService.observeReadyFinalize().subscribe((state) => {
      this.ready = state === ReadyState.Ready;
    });
  }
}
