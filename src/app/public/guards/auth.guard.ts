import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
  Router,
} from '@angular/router';

import { AuthService } from '../services/auth.service';
import { OAuthProvider } from '../services/oauth/oauth-provider.interface';
import { urlSearchParamsObject } from '../utils/utils';
import { Readyable, ReadyState } from '../classes/readyable';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard extends Readyable implements CanActivate {
  readonly authFailRedirectTree: UrlTree;

  readonly ReadyConditions = [this.oauthService];

  constructor(
    readonly authService: AuthService,
    readonly oauthService: OAuthProvider,
    readonly router: Router
  ) {
    super();
    this.authFailRedirectTree = router.createUrlTree(['/login']);

    this.readyInit();
  }

  async canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Promise<boolean | UrlTree> {
    console.debug('AuthGuard:', { next, state });

    if (!this.isReady) {
      console.debug('canActivate, waiting for ready');
      const ready = await this.observeReadyFinalize().toPromise();
      if (ready !== ReadyState.Ready) {
        return false;
      }
    }

    let success = false;
    if (next.url[0]?.path === 'authed') {
      // this is an oauth redirect request
      return this.handleAuthedEndpoint(next);
    } else if (this.authService.isAuthenticated()) {
      // they're already auth'd
      success = true;
    }
    this.oauthService.generateNewState();

    console.debug('AuthGuard success =', success);
    if (success) {
      return true;
    } else {
      return this.authFailRedirectTree;
    }
  }

  async handleAuthedEndpoint(
    next: ActivatedRouteSnapshot
  ): Promise<false | UrlTree> {
    const isToken = this.oauthService.responseType === 'token';
    const argVal = isToken
      ? urlSearchParamsObject(document.location.hash.substring(1))
      : next.queryParamMap;
    const success = await this.oauthService.parseOAuthCallback(argVal);

    console.debug('handleAuthedEndpoint success =', success);
    if (success) {
      document.location.hash = '';
      return this.router.createUrlTree(['']);
    } else {
      return false;
    }
  }
}
