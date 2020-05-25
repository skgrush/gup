// External Modules
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// My Modules
import { GupCommonModule } from 'src/app/gup-common/gup-common.module';

// This Module's Declarations
import { FileManagerComponent } from './components/file-manager/file-manager.component';
import { CopyLinkComponent } from './components/copy-link/copy-link.component';
import { FileListComponent } from './components/file-manager/file-list/file-list.component';
import { FileRowComponent } from './components/file-manager/file-row/file-row.component';
import { FileCellLastmodifiedComponent } from './components/file-manager/file-cell/file-cell-lastmodified.component';
import { FileCellSizeComponent } from './components/file-manager/file-cell/file-cell-size.component';
import { DraggableHeaderDirective } from './directives/draggable-header.directive';

@NgModule({
  declarations: [
    FileManagerComponent,
    FileListComponent,
    FileRowComponent,
    FileCellLastmodifiedComponent,
    FileCellSizeComponent,
    CopyLinkComponent,
    DraggableHeaderDirective,
  ],
  imports: [
    CommonModule,
    // my modules
    GupCommonModule,
  ],
  exports: [FileManagerComponent],
})
export class FileManagerModule {}
