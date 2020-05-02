import { Component, OnInit } from '@angular/core';
import { OAuthProvider } from 'src/app/services/oauth/oauth-provider.interface';
import { ReadyState } from 'src/app/classes/readyable';

@Component({
  selector: 'gup-oauth',
  templateUrl: './oauth.component.html',
  styleUrls: ['./oauth.component.scss'],
})
export class OauthComponent implements OnInit {
  get additionalParams() {
    if (!this.oauthService.additionalParams) {
      return [];
    }
    return Object.entries(this.oauthService.additionalParams);
  }

  ready = false;

  constructor(readonly oauthService: OAuthProvider) {
    oauthService.observeReadyFinalize().subscribe((state) => {
      console.debug('oauthService is ready');
      this.ready = state === ReadyState.Ready;
    });
  }

  ngOnInit(): void {}
}
