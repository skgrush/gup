import { Component, HostBinding } from '@angular/core';
import { BaseFileCellComponent } from './base-file-cell.component';
import { FEHeaderId } from '../../../enums/file-entity-headers.enum';

@Component({
  selector: 'gup-file-cell-uploader',
  template: '{{ uploader }}',
  styleUrls: ['./base-file-cell.component.scss'],
})
export class FileCellUploaderComponent extends BaseFileCellComponent {
  @HostBinding('attr.headers')
  readonly headerId = FEHeaderId.size;

  get uploader() {
    if ('uploader' in this.fileEntity) {
      return this.fileEntity.uploader;
    }
  }
}
