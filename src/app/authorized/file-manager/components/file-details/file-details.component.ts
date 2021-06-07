import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import {
  IFileEntityHeaded,
  IFileEntity,
  IModifyParameters,
} from '../../interfaces/file-management';
import { FormGroup, FormControl } from '@angular/forms';
import { StorageClasses } from '../../interfaces/s3-data';

@Component({
  selector: 'gup-file-details',
  templateUrl: './file-details.component.html',
  styleUrls: ['./file-details.component.scss'],
})
export class FileDetailsComponent implements OnChanges {
  readonly StorageClasses = StorageClasses;

  @Input()
  file?: IFileEntityHeaded;

  @Input()
  publicRoot?: string;

  @Output()
  closeDialog = new EventEmitter<void>();

  @Output()
  deleteFile = new EventEmitter<IFileEntity>();

  @Output()
  modifyFile = new EventEmitter<[IFileEntity, IModifyParameters]>();

  get isOpen() {
    return this.file ? true : null;
  }

  get url() {
    if (this.publicRoot && this.file) {
      return this.publicRoot + this.file.key;
    }
  }

  formGroup = new FormGroup({
    key: new FormControl(''),
    storageClass: new FormControl('STANDARD'),
    cacheControl: new FormControl(''),
  });

  ngOnChanges(changes: SimpleChanges) {
    if (changes.file) {
      this.updateFormGroup();
    }
  }

  onSubmitModify(e: Event) {
    console.warn('MODIFY', e, this.file, this.formGroup);

    const { key, storageClass, cacheControl } = this.formGroup.value;

    if (this.file) {
      this.modifyFile.emit([this.file, {
        cacheControl,
        key,
        storageClass,
      }]);
    }

    e.preventDefault();
  }

  updateFormGroup() {
    const { file } = this;

    this.formGroup.reset({
      key: file?.key ?? '',
      storageClass: file?.storageClass ?? 'STANDARD',
      cacheControl: file?.cacheControl ?? '',
    });
  }
}
