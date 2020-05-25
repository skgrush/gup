import { HostBinding, Inject } from '@angular/core';
import { IFileEntity } from '../../../interfaces/file-management';
import { FEHeaderId } from '../../../enums/file-entity-headers.enum';
import { FILE_ENTITY } from 'src/app/tokens';

export abstract class BaseFileCellComponent {
  @HostBinding('attr.role')
  readonly ariaRole = 'cell';

  @HostBinding('attr.headers')
  abstract readonly headerId: FEHeaderId;

  constructor(@Inject(FILE_ENTITY) readonly fileEntity: IFileEntity) {}
}
