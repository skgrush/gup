import { Routes, RouterModule } from '@angular/router';
import { MainComponent } from './components/main/main.component';
import { NgModule } from '@angular/core';

const authedRoutes: Routes = [
  {
    path: '',
    component: MainComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(authedRoutes)],
  exports: [RouterModule],
})
export class AuthorizedRoutingModule {}
