import {
  Component,
  Input,
  HostBinding,
  Injector,
  SimpleChanges,
} from '@angular/core';
import { IFileEntity, EntityState } from '../../../interfaces/file-management';
import { BaseFileCellComponent } from '../file-cell/base-file-cell.component';
import { FILE_ENTITY } from 'src/app/tokens';

@Component({
  selector: 'gup-file-row',
  templateUrl: './file-row.component.html',
  styleUrls: ['./file-row.component.scss'],
})
export class FileRowComponent {
  readonly EntityState = EntityState;

  @Input()
  fileEntity?: IFileEntity;

  @Input()
  cellComponents!: Array<typeof BaseFileCellComponent>;

  @Input()
  publicRoot?: string;

  @HostBinding('attr.data-key')
  get dataKey() {
    return this.fileEntity?.key;
  }

  get keyTitle() {
    if (this.fileEntity?.eTag) {
      return 'ETag: ' + this.fileEntity.eTag;
    }
  }

  readonly fileEntityInjector: Injector;

  constructor(readonly injector: Injector) {
    this.fileEntityInjector = Injector.create({
      providers: [
        {
          provide: FILE_ENTITY,
          useFactory: () => this.fileEntity,
        },
      ],
      parent: injector,
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.fileEntity) {
      console.debug('row fileEntity updated', this.fileEntity);
    }
    if (this.cellComponents) {
      console.debug('row colComponents updated', this.cellComponents);
    }
  }

  getUrl(fileEntity?: IFileEntity) {
    if (this.publicRoot && fileEntity) {
      return this.publicRoot + fileEntity.key;
    }
  }
}
