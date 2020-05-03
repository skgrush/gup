import { Component, OnInit, Input } from '@angular/core';
import { IFileEntity } from 'src/app/interfaces/file-management';

@Component({
  selector: 'gup-file-list',
  templateUrl: './file-list.component.html',
  styleUrls: ['./file-list.component.scss'],
})
export class FileListComponent implements OnInit {
  @Input()
  fileData?: ReadonlyArray<Readonly<IFileEntity>>;

  @Input()
  disabled = false;

  readonly headers = Object.freeze({
    'file-col-key': 'Key',
    'file-col-size': 'Size',
    'file-col-contentType': 'Content-type',
    'file-col-uploader': 'Uploader',
    'file-col-lastModified': 'Last modified',
  });

  get headerEntries() {
    return Object.entries(this.headers);
  }

  constructor() {}

  ngOnInit(): void {}
}
