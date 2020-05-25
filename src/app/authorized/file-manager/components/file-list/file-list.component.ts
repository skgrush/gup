import {
  Component,
  Input,
  Output,
  EventEmitter,
  SimpleChanges,
  OnChanges,
} from '@angular/core';
import { IFileEntity } from '../../../interfaces/file-management';
import { SortOrder } from 'src/app/enums/sort-order.enum';
import {
  FEHeaderId,
  FEHeaderName,
  FEMovableKeyType,
  FEKeyType,
} from '../../../enums/file-entity-headers.enum';
import { BaseFileCellComponent } from '../file-cell/base-file-cell.component';
import { pickFileCellComponent } from '../file-cell/pick-file-cell';

interface IHeaderEntry {
  headerId: FEHeaderId;
  sortOrder: SortOrder | undefined;
  draggable: boolean;
  name: FEHeaderName;
  key: FEKeyType;
}

@Component({
  selector: 'gup-file-list',
  templateUrl: './file-list.component.html',
  styleUrls: ['./file-list.component.scss'],
})
export class FileListComponent implements OnChanges {
  @Input()
  fileData?: ReadonlyArray<Readonly<IFileEntity>>;

  @Input()
  disabled = false;

  @Input()
  sortField?: FEKeyType;

  @Input()
  sortOrder: SortOrder = SortOrder.Ascending;

  @Input()
  columnOrder: FEMovableKeyType[] = [];

  @Input()
  publicRoot?: string;

  @Output()
  changeSort = new EventEmitter<FEKeyType>();

  @Output()
  moveHeaderFromTo = new EventEmitter<[FEMovableKeyType, FEMovableKeyType]>();

  cellComponents: Array<typeof BaseFileCellComponent>;
  headerEntries: IHeaderEntry[];

  allowColumnReordering = true;

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
        draggable: key !== 'key',
      });
    }
    return entries;
  }

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
