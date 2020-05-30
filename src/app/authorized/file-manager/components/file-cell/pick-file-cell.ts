import { BaseFileCellComponent } from './base-file-cell.component';
import { FileCellContenttypeComponent } from './file-cell-contenttype.component';
import { FileCellLastmodifiedComponent } from './file-cell-lastmodified.component';
import { FileCellSizeComponent } from './file-cell-size.component';
import { FileCellUploaderComponent } from './file-cell-uploader.component';
import { FEKeyType } from '../../enums/file-entity-headers.enum';
import { FileCellStorageclassComponent } from './file-cell-storageclass.component';

const fileCellComponentRegistry = Object.freeze({
  contentType: FileCellContenttypeComponent,
  lastModified: FileCellLastmodifiedComponent,
  size: FileCellSizeComponent,
  uploader: FileCellUploaderComponent,
  storageClass: FileCellStorageclassComponent,
  /** the key column is rendered by FileRowComponent */
  key: undefined,
});

export function pickFileCellComponent(
  key: FEKeyType
): typeof BaseFileCellComponent {
  const component = fileCellComponentRegistry[key];
  if (component) {
    return component;
  } else {
    throw new Error(`Unpickable file key: ${key}`);
  }
}
