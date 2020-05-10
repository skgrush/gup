import { Component, HostBinding } from '@angular/core';
import { BaseFileCellComponent } from './base-file-cell.component';
import { FEHeaderId } from 'src/app/enums/file-entity-headers.enum';

@Component({
  selector: 'gup-file-cell-lastmodified',
  template: `
    <time *ngIf="fileEntity.lastModified" [dateTime]="fileEntity.lastModified">
      {{ fileEntity.lastModified | date }}
    </time>
  `,
  styleUrls: ['./base-file-cell.component.scss'],
})
export class FileCellLastmodifiedComponent extends BaseFileCellComponent {
  @HostBinding('title')
  get title() {
    return this.fileEntity.lastModified;
  }

  @HostBinding('style.text-align')
  readonly textAlign = 'right';

  @HostBinding('attr.headers')
  readonly headerId = FEHeaderId.lastModified;
}
