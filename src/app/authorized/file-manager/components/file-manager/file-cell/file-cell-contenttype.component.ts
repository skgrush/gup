import { Component, HostBinding } from '@angular/core';
import { BaseFileCellComponent } from './base-file-cell.component';
import { FEHeaderId } from 'src/app/enums/file-entity-headers.enum';

@Component({
  selector: 'gup-file-cell-contenttype',
  template: '{{ contentType }}',
  styleUrls: ['./base-file-cell.component.scss'],
})
export class FileCellContenttypeComponent extends BaseFileCellComponent {
  @HostBinding('attr.headers')
  readonly headerId = FEHeaderId.contentType;

  get contentType() {
    if ('contentType' in this.fileEntity) {
      return this.fileEntity.contentType;
    }
  }
}
