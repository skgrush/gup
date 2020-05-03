import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MainComponent } from './components/main/main.component';
import { AuthGuard } from './guards/auth.guard';
import { OauthComponent } from './components/oauth/oauth.component';

const routes: Routes = [
  {
    path: '',
    component: MainComponent,
    canActivate: [AuthGuard],
    pathMatch: 'full',
  },
  {
    path: 'authed',
    canActivate: [AuthGuard],
    component: Object, // dummy component
  },
  {
    path: 'login',
    component: OauthComponent,
    // canActivate: [AuthGuard],
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
