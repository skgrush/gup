import { SortField } from 'src/app/services/file-manager.service';
import { BaseFileCellComponent } from './base-file-cell.component';
import { FileCellContenttypeComponent } from './file-cell-contenttype.component';
import { FileCellLastmodifiedComponent } from './file-cell-lastmodified.component';
import { FileCellSizeComponent } from './file-cell-size.component';
import { FileCellUploaderComponent } from './file-cell-uploader.component';

export function pickFileCellComponent(
  key: SortField
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
