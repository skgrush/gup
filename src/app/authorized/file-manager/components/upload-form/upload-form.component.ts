import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  AfterViewInit,
  EventEmitter,
  Output,
} from '@angular/core';
import {
  FormGroup,
  FormControl,
  AbstractControl,
  ValidatorFn,
  Validators,
} from '@angular/forms';

import {
  IFileFormValue,
  IProgress,
  IUrlFormValue,
} from '../../interfaces/file-management';
import { LoggerService } from 'src/app/gup-common/services/logger/logger.service';
import { StorageClasses, StorageClass } from '../../interfaces/s3-data';

@Component({
  selector: 'gup-upload-form',
  templateUrl: './upload-form.component.html',
  styleUrls: ['./upload-form.component.scss'],
})
export class UploadFormComponent implements OnInit, AfterViewInit {
  readonly StorageClasses = StorageClasses;

  @Output()
  fileSubmit = new EventEmitter<IFileFormValue>();

  @Output()
  urlSubmit = new EventEmitter<IUrlFormValue>();

  @ViewChild('uploadDialog')
  uploadDialog?: ElementRef<HTMLDialogElement>;

  isOpen = false;
  inProgress = false;
  file?: File;
  _namePlaceholder = '';

  progressLoaded?: number;
  progressTotal?: number;
  progressDeterminate = false;

  formGroup!: FormGroup;

  selectedTab: 'file' | 'url' = 'file';

  get namePlaceholder() {
    if (this.selectedTab === 'file') {
      return this._namePlaceholder;
    } else {
      return '';
    }
  }

  constructor(private readonly _logger: LoggerService) {}

  open() {
    this.reset();
    this.isOpen = true;
  }

  close() {
    this.reset();
    this.isOpen = false;
  }

  ngOnInit(): void {
    this.formGroup = new FormGroup({
      name: new FormControl('', [this.validateNameOrPlaceholder]),
      file: new FormControl(''),
      url: new FormControl(''),
      storageClass: new FormControl('', [Validators.required]),
      maxAge: new FormControl(''),
    });
    this._setFormDefaults();
  }

  ngAfterViewInit(): void {
    if (!this.uploadDialog) {
      throw new Error('missing uploadDialog');
    }
  }

  onSubmit(e: Event) {
    const name: string = this.formGroup.value.name ?? this.namePlaceholder;
    const progress = this.progress.bind(this);
    const storageClass: StorageClass = this.formGroup.value.storageClass;
    const maxAge: number | null = this.formGroup.value.maxAge;

    this._logger.debug('submit:', e, this.formGroup);
    if (!this.formGroup.invalid) {
      this.inProgress = true;
      this.formGroup.disable();

      if (this.selectedTab === 'file' && this.file) {
        this.fileSubmit.emit({
          file: this.file,
          name,
          storageClass,
          maxAge: maxAge ?? undefined,
          progress,
        });
      } else if (this.selectedTab === 'url') {
        const url: string = this.formGroup.value.url;
        this.urlSubmit.emit({
          url,
          name,
          storageClass,
          maxAge: maxAge ?? undefined,
          progress,
        });
      }
    }
    e.preventDefault();
  }

  onFileInput(e: InputEvent) {
    if (e.target instanceof HTMLInputElement) {
      const { files } = e.target;
      this.file = (files && files[0]) ?? undefined;
      this._namePlaceholder = this.file?.name ?? '';
      this.formGroup.controls.name.updateValueAndValidity();
    }
  }

  onUrlInput(e: InputEvent) {
    this.formGroup.controls.name.updateValueAndValidity();
  }

  onTabSelected(tabName: string) {
    if (tabName === 'Upload') {
      this.selectedTab = 'file';
    } else if (tabName === 'Link') {
      this.selectedTab = 'url';
    } else {
      this._logger.warn('unexpected tab selected:', tabName);
    }
    setTimeout(() => this.formGroup.controls.name.updateValueAndValidity());
  }

  /**
   * Callback when progress is made on the upload.
   */
  progress(p: IProgress) {
    if ('success' in p) {
      this.inProgress = false;
      if (p.success) {
        this.close();
      } else {
        this.formGroup.enable();
        // failed
      }
    } else {
      // still in progress
      this.progressLoaded = p.loaded;
      this.progressTotal = p.total;
      this.progressDeterminate =
        p.loaded !== undefined && p.total !== undefined;
    }
  }

  reset() {
    this.inProgress = false;
    this._namePlaceholder = '';
    this.file = undefined;
    this.formGroup.reset();
    this._setFormDefaults();
    this.formGroup.enable();
  }

  private _setFormDefaults() {
    this.formGroup.controls.maxAge.setValue(3600);
    this.formGroup.controls.storageClass.setValue('STANDARD');
  }

  validateNameOrPlaceholder: ValidatorFn = (control: AbstractControl) => {
    if (this.formGroup && !control.value && !this.namePlaceholder) {
      return { missingName: { value: control.value } };
    }
    return null;
  };
}

function validateDateField(control: AbstractControl) {
  if (control.value && isNaN(Date.parse(control.value))) {
    return { invalidDate: { value: control.value } };
  }
  return null;
}
