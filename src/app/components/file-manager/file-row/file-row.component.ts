import { Component, OnInit, Input, HostBinding } from '@angular/core';
import {
  IFileEntity,
  EntityState,
  IFileEntityHeaded,
} from 'src/app/interfaces/file-management';

@Component({
  selector: 'gup-file-row',
  templateUrl: './file-row.component.html',
  styleUrls: ['./file-row.component.scss'],
})
export class FileRowComponent implements OnInit {
  readonly EntityState = EntityState;

  @Input()
  fileEntity?: IFileEntity;

  @HostBinding('attr.data-key')
  get dataKey() {
    return this.fileEntity?.key;
  }

  get keyTitle() {
    if (this.fileEntity?.eTag) {
      return 'ETag: ' + this.fileEntity.eTag;
    }
  }

  get contentType() {
    if (this.fileEntity && this.fileEntity.entityState >= EntityState.head) {
      return (this.fileEntity as IFileEntityHeaded).contentType;
    }
  }

  get uploader() {
    if (this.fileEntity && this.fileEntity.entityState >= EntityState.head) {
      return (this.fileEntity as IFileEntityHeaded).uploader;
    }
  }

  constructor() {}

  ngOnInit(): void {}
}
