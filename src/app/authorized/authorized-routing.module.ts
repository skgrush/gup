import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { AuthorizedComponent } from './authorized.component';

const authedRoutes: Routes = [
  {
    path: '',
    component: AuthorizedComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(authedRoutes)],
  exports: [RouterModule],
})
export class AuthorizedRoutingModule {}
