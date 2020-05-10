import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  SimpleChanges,
  OnChanges,
} from '@angular/core';
import { IFileEntity } from 'src/app/interfaces/file-management';
import { SortOrder } from 'src/app/enums/sort-order.enum';
import {
  FEHeaderId,
  FEHeaderName,
} from 'src/app/enums/file-entity-headers.enum';
import {
  SortField,
  SortableColumn,
} from 'src/app/services/file-manager.service';
import { BaseFileCellComponent } from '../file-cell/base-file-cell.component';
import { pickFileCellComponent } from '../file-cell/pick-file-cell';

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
export class FileListComponent implements OnInit, OnChanges {
  @Input()
  fileData?: ReadonlyArray<Readonly<IFileEntity>>;

  @Input()
  disabled = false;

  @Input()
  sortField?: SortField;

  @Input()
  sortOrder: SortOrder = SortOrder.Ascending;

  @Input()
  columnOrder: SortableColumn[] = [];

  @Output()
  changeSort = new EventEmitter<SortField>();

  cellComponents: Array<typeof BaseFileCellComponent>;
  headerEntries: IHeaderEntry[];

  constructor() {
    [this.cellComponents, this.headerEntries] = this._orderColumns();
  }

  private _orderColumns() {
    const cols: Array<typeof BaseFileCellComponent> = [];
    for (const key of this.columnOrder) {
      cols.push(pickFileCellComponent(key));
    }

    const headers = this._makeHeaderEntries();
    return [cols, headers] as const;
  }

  private _makeHeaderEntries() {
    const keys = ['key', ...this.columnOrder] as const;
    const entries: IHeaderEntry[] = [];
    for (const key of keys) {
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

  ngOnInit(): void {}

  ngOnChanges(changes: SimpleChanges) {
    // If column order has changed refresh everything,
    // otherwise only refresh headers. Prevents over-updating.
    if (changes.columnOrder) {
      [this.cellComponents, this.headerEntries] = this._orderColumns();
    } else if (changes.sortField || changes.sortOrder) {
      this.headerEntries = this._makeHeaderEntries();
    }
  }
}
