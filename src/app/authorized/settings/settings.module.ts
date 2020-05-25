import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthedSettingsComponent } from './components/authed-settings/authed-settings.component';
import { QrComponent } from './components/qr/qr.component';
import { TotpQrPopupComponent } from './components/totp-qr-popup/totp-qr-popup.component';
import { GupCommonModule } from 'src/app/gup-common/gup-common.module';
import { TabbedComponentModule } from 'src/app/tabbed-component/tabbed-component.module';

@NgModule({
  declarations: [AuthedSettingsComponent, QrComponent, TotpQrPopupComponent],
  imports: [CommonModule, GupCommonModule, TabbedComponentModule],
})
export class SettingsModule {}
