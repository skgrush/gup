import { Component } from '@angular/core';
import { AuthService } from './services/auth.service';
import { LocationStrategy } from '@angular/common';

@Component({
  selector: 'gup-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'grushup';

  constructor() {}
}
