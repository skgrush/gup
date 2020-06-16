// External Modules
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

// My Modules
import { GupCommonModule } from 'src/app/gup-common/gup-common.module';
import { TabbedComponentModule } from '../tabbed-component/tabbed-component.module';

// This Module's Declarations
import { FileManagerComponent } from './file-manager.component';
import { CopyLinkComponent } from './components/copy-link/copy-link.component';
import { FileListComponent } from './components/file-list/file-list.component';
import { FileRowComponent } from './components/file-row/file-row.component';
import { FileCellLastmodifiedComponent } from './components/file-cell/file-cell-lastmodified.component';
import { FileCellSizeComponent } from './components/file-cell/file-cell-size.component';
import { DraggableHeaderDirective } from './directives/draggable-header.directive';
import { UploadFormComponent } from './components/upload-form/upload-form.component';

// other references
import { LoggerService } from 'src/app/gup-common/services/logger/logger.service';
import { FileDetailsComponent } from './components/file-details/file-details.component';
import { IFileManagerService } from './services/file-manager.interface';
import { FileManagerService } from './services/file-manager.service';

@NgModule({
  declarations: [
    FileManagerComponent,
    FileListComponent,
    FileRowComponent,
    FileCellLastmodifiedComponent,
    FileCellSizeComponent,
    CopyLinkComponent,
    DraggableHeaderDirective,
    UploadFormComponent,
    FileDetailsComponent,
  ],
  imports: [
    CommonModule,
    // my modules
    GupCommonModule,
    TabbedComponentModule,
    ReactiveFormsModule,
  ],
  providers: [{ provide: IFileManagerService, useClass: FileManagerService }],
  exports: [FileManagerComponent],
})
export class FileManagerModule {
  constructor(readonly logger: LoggerService) {
    logger.initialize('FileManager', 'module', logger);
  }
}
