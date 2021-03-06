import { Component, Inject } from '@angular/core';
import { IEnvConfigService } from './public/services/env-config/env-config.interface';

@Component({
  selector: 'gup-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'GUP';

  constructor(readonly envConfig: IEnvConfigService) {
    this.envConfig.env.subscribe((env) => {
      window.document.title = this.title = env.siteName;
    });
  }
}
