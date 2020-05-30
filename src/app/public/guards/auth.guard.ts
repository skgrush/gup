import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
  Router,
  CanLoad,
} from '@angular/router';
import { Route } from '@angular/compiler/src/core';

import { AuthService } from '../services/auth.service';
import { OAuthProvider } from '../services/oauth/oauth-provider.interface';
import { urlSearchParamsObject } from 'src/app/shared/utils/utils';
import { Readyable, ReadyState } from 'src/app/classes/readyable';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard extends Readyable implements CanActivate, CanLoad {
  readonly ReadyConditions = [this.oauthService];

  readonly authFailRoute = ['/login'];
  readonly authFailRedirectTree = this.router.createUrlTree(this.authFailRoute);

  constructor(
    readonly authService: AuthService,
    readonly oauthService: OAuthProvider,
    readonly router: Router
  ) {
    super();

    this.readyInit();
  }

  async canLoad(route: Route) {
    console.debug('AuthGuard.canLoad:', { route });

    if (!(await this._waitTilReady())) {
      return false;
    }

    const isAuthed = await this.authService.isAuthenticated();

    console.debug('isAuthenticated:', isAuthed);
    if (!isAuthed) {
      this.router.navigate(this.authFailRoute);
    }
    return isAuthed;
  }

  /**
   * Protect auth-related routes.
   * @returns `false` if dependencies failed or handleAuthedEndpoint failed.
   * @returns `true` if you're authorized.
   * @returns `UrlTree` redirecting to login if you're unauthorized.
   */
  async canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Promise<boolean | UrlTree> {
    console.debug('AuthGuard.canActivate:', { next, state });

    if (!(await this._waitTilReady())) {
      return false;
    }

    let success = false;
    if (next.url[0]?.path === 'authed') {
      // this is an oauth redirect request
      return this._handleAuthedEndpoint(next);
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

  private async _handleAuthedEndpoint(
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

  private async _waitTilReady(): Promise<boolean> {
    if (!this.isReady) {
      console.debug('AuthGuard, waiting for ready');
      const ready = await this.observeReadyFinalize().toPromise();
      console.debug('AuthGuard ready?', ready);
      if (ready !== ReadyState.Ready) {
        return false;
      }
    }
    return true;
  }
}
