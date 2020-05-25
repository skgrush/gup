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
  Validators,
  AbstractControl,
  ValidatorFn,
} from '@angular/forms';

import {
  IFileFormValue,
  IProgress,
  IUrlFormValue,
} from 'src/app/interfaces/file-management';

@Component({
  selector: 'gup-upload-form',
  templateUrl: './upload-form.component.html',
  styleUrls: ['./upload-form.component.scss'],
})
export class UploadFormComponent implements OnInit, AfterViewInit {
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
      expires: new FormControl('', [validateDateField]),
      maxAge: new FormControl(''),
    });
  }

  ngAfterViewInit(): void {
    if (!this.uploadDialog) {
      throw new Error('missing uploadDialog');
    }
    console.debug('afterViewInit:', this.uploadDialog);
  }

  onSubmit(e: Event) {
    const name: string = this.formGroup.value.name ?? this.namePlaceholder;
    const progress = this.progress.bind(this);
    const expires: string | null = this.formGroup.value.expires;
    const maxAge: number | null = this.formGroup.value.maxAge;

    console.debug('submit:', e, this.formGroup);
    if (!this.formGroup.invalid) {
      this.inProgress = true;
      this.formGroup.disable();

      if (this.selectedTab === 'file' && this.file) {
        this.fileSubmit.emit({
          file: this.file,
          name,
          expires: expires ? new Date(expires) : undefined,
          maxAge: maxAge ?? undefined,
          progress,
        });
      } else if (this.selectedTab === 'url') {
        const url: string = this.formGroup.value.url;
        this.urlSubmit.emit({
          url,
          name,
          expires: expires ? new Date(expires) : undefined,
          maxAge: maxAge ?? undefined,
          progress,
        });
      }
    }
    e.preventDefault();
  }

  onFileInput(e: InputEvent) {
    console.warn('input:', e);
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
    console.debug('tabSelected:', tabName);
    if (tabName === 'Upload') {
      this.selectedTab = 'file';
    } else if (tabName === 'Link') {
      this.selectedTab = 'url';
    } else {
      console.warn('unexpected tab selected:', tabName);
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
    this.formGroup.enable();
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
