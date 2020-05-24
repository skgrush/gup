import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthedSettingsComponent } from './components/authed-settings/authed-settings.component';
import { CopyLinkComponent } from './components/copy-link/copy-link.component';
import { FileManagerComponent } from './components/file-manager/file-manager.component';
import { FileListComponent } from './components/file-manager/file-list/file-list.component';
import { FileRowComponent } from './components/file-manager/file-row/file-row.component';
import { ApiService } from './services/api/api.service';
import { FileManagerService } from './services/file-manager.service';

@NgModule({
  declarations: [
    AuthedSettingsComponent,
    CopyLinkComponent,
    FileManagerComponent,
    FileListComponent,
    FileRowComponent,
  ],
  imports: [CommonModule],
  exports: [
    AuthedSettingsComponent,
    CopyLinkComponent,
    FileManagerComponent,
    ApiService,
    FileManagerService,
  ],
})
export class AuthorizedModule {}
