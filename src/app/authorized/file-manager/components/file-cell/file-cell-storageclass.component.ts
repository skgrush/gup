import { BaseFileCellComponent } from './base-file-cell.component';
import { Component } from '@angular/core';
import { FEHeaderId } from '../../enums/file-entity-headers.enum';

@Component({
  selector: 'gup-file-storageclass',
  template: '{{ fileEntity.storageClass }}',
  styleUrls: ['./base-file-cell.component.scss'],
})
export class FileCellStorageclassComponent extends BaseFileCellComponent {
  readonly headerId = FEHeaderId.storageClass;
}
