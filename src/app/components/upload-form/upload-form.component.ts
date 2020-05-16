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
} from '@angular/forms';

import { IFileFormValue, IProgress } from 'src/app/interfaces/file-management';

@Component({
  selector: 'gup-upload-form',
  templateUrl: './upload-form.component.html',
  styleUrls: ['./upload-form.component.scss'],
})
export class UploadFormComponent implements OnInit, AfterViewInit {
  @Output()
  fileSubmit = new EventEmitter<IFileFormValue>();

  @ViewChild('uploadDialog')
  uploadDialog?: ElementRef<HTMLDialogElement>;

  isOpen = false;
  inProgress = false;
  file?: File;
  namePlaceholder = '';

  progressLoaded?: number;
  progressTotal?: number;
  progressDeterminate = false;

  formGroup!: FormGroup;

  constructor() {}

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
      name: new FormControl(''),
      file: new FormControl('', [Validators.required]),
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
    const expires: string | null = this.formGroup.value.expires;
    const maxAge: number | null = this.formGroup.value.maxAge;

    console.debug('submit:', e, this.formGroup);
    if (this.file && !this.formGroup.invalid) {
      this.inProgress = true;
      this.formGroup.disable();
      this.fileSubmit.emit({
        file: this.file,
        name: this.formGroup.value.name ?? this.namePlaceholder,
        expires: expires ? new Date(expires) : undefined,
        maxAge: maxAge ?? undefined,
        progress: this.progress.bind(this),
      });
    }
    e.preventDefault();
  }

  onFileInput(e: InputEvent) {
    console.warn('input:', e);
    if (e.target instanceof HTMLInputElement) {
      const { files } = e.target;
      this.file = (files && files[0]) ?? undefined;
      this.namePlaceholder = this.file?.name ?? '';
    }
  }

  progress(p: IProgress) {
    if ('success' in p) {
      this.inProgress = false;
      if (p.success) {
        this.reset();
        this.isOpen = false;
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
    this.namePlaceholder = '';
    this.file = undefined;
    this.formGroup.reset();
  }
}

function validateDateField(control: AbstractControl) {
  if (control.value && isNaN(Date.parse(control.value))) {
    return { invalidDate: { value: control.value } };
  }
  return null;
}
