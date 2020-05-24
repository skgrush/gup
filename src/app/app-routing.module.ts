import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from './public/guards/auth.guard';
import { OauthComponent } from './public/components/oauth/oauth.component';
import { LogoutGuard } from './public/guards/logout.guard';

const DummyComponent = Object;

const routes: Routes = [
  {
    path: '',
    loadChildren: () =>
      import('./authorized/authorized.module').then((m) => m.AuthorizedModule),
    canLoad: [AuthGuard],
    pathMatch: 'full',
  },
  {
    path: 'authed',
    canActivate: [AuthGuard],
    component: DummyComponent,
  },
  {
    path: 'login',
    component: OauthComponent,
    // canActivate: [AuthGuard],
  },
  {
    path: 'logout',
    component: DummyComponent,
    canActivate: [LogoutGuard],
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
