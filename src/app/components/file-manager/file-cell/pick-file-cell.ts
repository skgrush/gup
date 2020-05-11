import { BaseFileCellComponent } from './base-file-cell.component';
import { FileCellContenttypeComponent } from './file-cell-contenttype.component';
import { FileCellLastmodifiedComponent } from './file-cell-lastmodified.component';
import { FileCellSizeComponent } from './file-cell-size.component';
import { FileCellUploaderComponent } from './file-cell-uploader.component';
import { FEKeyType } from 'src/app/enums/file-entity-headers.enum';

export function pickFileCellComponent(
  key: FEKeyType
): typeof BaseFileCellComponent {
  switch (key) {
    case 'contentType':
      return FileCellContenttypeComponent;
    case 'lastModified':
      return FileCellLastmodifiedComponent;
    case 'size':
      return FileCellSizeComponent;
    case 'uploader':
      return FileCellUploaderComponent;
    default:
      throw new Error(`Unpickable file key: ${key}`);
  }
}
