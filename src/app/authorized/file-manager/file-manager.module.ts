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

console.debug('loaded file-manager module');

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
  ],
  imports: [
    CommonModule,
    // my modules
    GupCommonModule,
    TabbedComponentModule,
    ReactiveFormsModule,
  ],
  exports: [FileManagerComponent],
})
export class FileManagerModule {}
