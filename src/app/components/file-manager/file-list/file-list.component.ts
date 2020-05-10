import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import {
  IFileEntity,
  IFileEntityGot,
} from 'src/app/interfaces/file-management';
import { SortOrder } from 'src/app/enums/sort-order.enum';
import {
  FEHeaderId,
  FEHeaderName,
  FEKeys,
} from 'src/app/enums/file-entity-headers.enum';
import { SortField } from 'src/app/services/file-manager.service';

interface IHeaderEntry {
  headerId: FEHeaderId;
  sortOrder: SortOrder | undefined;
  name: FEHeaderName;
  key: SortField;
}

@Component({
  selector: 'gup-file-list',
  templateUrl: './file-list.component.html',
  styleUrls: ['./file-list.component.scss'],
})
export class FileListComponent implements OnInit {
  @Input()
  fileData?: ReadonlyArray<Readonly<IFileEntity>>;

  @Input()
  disabled = false;

  @Input()
  sortField?: SortField;

  @Input()
  sortOrder: SortOrder = SortOrder.Ascending;

  @Output()
  changeSort = new EventEmitter<SortField>();

  get headerEntries() {
    const entries: IHeaderEntry[] = [];
    for (const key of FEKeys) {
      const sortOrder = this.sortField === key ? this.sortOrder : undefined;
      entries.push({
        headerId: FEHeaderId[key],
        name: FEHeaderName[key],
        sortOrder,
        key,
      });
    }
    return entries;
  }

  constructor() {}

  ngOnInit(): void {}
}
