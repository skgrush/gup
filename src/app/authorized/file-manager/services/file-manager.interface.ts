import { Readyable } from 'src/app/shared/classes/readyable';
import {
  IFileEntity,
  IFileFormValue,
  IModifyParameters,
  IUrlFormValue,
} from '../interfaces/file-management';
import { Observable } from 'rxjs';
import { FEMovableKeyType, FEKeyType } from '../enums/file-entity-headers.enum';
import { SortOrder } from '../enums/sort-order.enum';

export type StoreType = ReadonlyArray<Readonly<IFileEntity>>;

export abstract class IFileManagerService extends Readyable {
  abstract readonly errorMessage?: string;
  abstract readonly publicRoot?: string;

  abstract readonly sortedStore: Observable<StoreType>;
  abstract readonly columnOrder: Observable<FEMovableKeyType[]>;

  abstract readonly sortField: FEKeyType;
  abstract readonly sortOrder: SortOrder;

  abstract changeSort(key: FEKeyType): void;
  abstract flipSortOrder(): SortOrder;
  abstract changeColumnOrder(
    key: FEMovableKeyType,
    destination: FEMovableKeyType
  ): void;

  abstract refreshFileStore(): Promise<void>;

  abstract uploadFile(formValue: IFileFormValue): Promise<void>;
  abstract uploadUrl(formValue: IUrlFormValue): Promise<void>;
  abstract deleteFile(file: IFileEntity): Promise<void>;
  abstract modifyFile(file: IFileEntity, changes: IModifyParameters): Promise<void>;
}
