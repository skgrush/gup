import { Component, Inject } from '@angular/core';
import { SHOW_DEBUG } from './tokens';

@Component({
  selector: 'gup-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'grushup';

  constructor(@Inject(SHOW_DEBUG) readonly showDebug: boolean) {}
}
