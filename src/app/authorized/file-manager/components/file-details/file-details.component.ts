import { Component, Input, Output, EventEmitter } from '@angular/core';
import {
  IFileEntityHeaded,
  IFileEntity,
} from '../../interfaces/file-management';

@Component({
  selector: 'gup-file-details',
  templateUrl: './file-details.component.html',
  styleUrls: ['./file-details.component.scss'],
})
export class FileDetailsComponent {
  @Input()
  file?: IFileEntityHeaded;

  @Input()
  publicRoot?: string;

  @Output()
  closeDialog = new EventEmitter<void>();

  @Output()
  deleteFile = new EventEmitter<IFileEntity>();

  get isOpen() {
    return this.file ? true : null;
  }

  get url() {
    if (this.publicRoot && this.file) {
      return this.publicRoot + this.file.key;
    }
  }
}
