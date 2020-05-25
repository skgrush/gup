import { Component, HostBinding } from '@angular/core';
import { BaseFileCellComponent } from './base-file-cell.component';
import { FEHeaderId } from '../../../enums/file-entity-headers.enum';

@Component({
  selector: 'gup-file-cell-size',
  template: '{{ fileEntity.size | byteFormat }}',
  styleUrls: ['./base-file-cell.component.scss'],
})
export class FileCellSizeComponent extends BaseFileCellComponent {
  @HostBinding('title')
  get title() {
    return this.fileEntity.size.toString();
  }

  @HostBinding('style.text-align')
  readonly textAlign = 'right';

  @HostBinding('attr.headers')
  readonly headerId = FEHeaderId.size;
}
