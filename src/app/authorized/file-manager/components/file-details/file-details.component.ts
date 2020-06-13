import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { IFileEntityHeaded } from '../../interfaces/file-management';

@Component({
  selector: 'gup-file-details',
  templateUrl: './file-details.component.html',
  styleUrls: ['./file-details.component.scss'],
})
export class FileDetailsComponent implements OnInit {
  @Input()
  file?: IFileEntityHeaded;

  @Output()
  closeDialog = new EventEmitter<void>();

  get isOpen() {
    return this.file ? true : null;
  }

  constructor() {}

  ngOnInit(): void {}
}
