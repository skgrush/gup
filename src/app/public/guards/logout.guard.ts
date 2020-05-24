import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
  Router,
} from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class LogoutGuard implements CanActivate {
  constructor(readonly auth: AuthService, readonly router: Router) {}

  canActivate(): UrlTree {
    this.auth.deauthenticate();

    document.location.hash = '';
    return this.router.createUrlTree(['/login']);
  }
}
