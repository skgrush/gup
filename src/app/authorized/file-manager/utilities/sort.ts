import { IFileEntityGot, IFileEntity } from '../interfaces/file-management';
import { SortOrder } from 'src/app/enums/sort-order.enum';

function sorter<T>(key: string, posRet: number, negRet: number, a: T, b: T) {
  const aval = (a as any)[key];
  const bval = (b as any)[key];
  if (aval === undefined && bval === undefined) {
    return 0;
  }
  if (aval === undefined) {
    return 1;
  }
  if (bval === undefined) {
    return -1;
  }
  if (aval < bval) {
    return negRet;
  }
  if (bval < aval) {
    return posRet;
  }
  return 0;
}

export function sortFactory(key: keyof IFileEntityGot, order: SortOrder) {
  if (order === SortOrder.Ascending) {
    return (a: IFileEntity, b: IFileEntity) => sorter(key, 1, -1, a, b);
  } else {
    return (a: IFileEntity, b: IFileEntity) => sorter(key, -1, 1, a, b);
  }
}
