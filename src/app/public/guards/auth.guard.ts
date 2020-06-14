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
import { Readyable, ReadyState } from 'src/app/shared/classes/readyable';
import { LoggerService } from 'src/app/gup-common/services/logger/logger.service';

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
    readonly router: Router,
    private readonly _logger: LoggerService
  ) {
    super();
    this._logger.initialize('Auth', 'guard', this);

    this.readyInit();
  }

  async canLoad(route: Route) {
    this._logger.debug('AuthGuard.canLoad:', { route });

    if (!(await this._waitTilReady())) {
      return false;
    }

    const isAuthed = await this.authService.isAuthenticated();

    this._logger.debug('isAuthenticated:', isAuthed);
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
    this._logger.debug('AuthGuard.canActivate:', { next, state });

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

    this._logger.debug('AuthGuard success =', success);
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

    this._logger.debug('handleAuthedEndpoint success =', success);
    if (success) {
      document.location.hash = '';
      return this.router.createUrlTree(['']);
    } else {
      return false;
    }
  }

  private async _waitTilReady(): Promise<boolean> {
    if (!this.isReady) {
      const ready = await this.finalObservable.toPromise();
      if (ready !== ReadyState.Ready) {
        return false;
      }
    }
    return true;
  }
}
