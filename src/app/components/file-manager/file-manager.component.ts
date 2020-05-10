import { Component, OnInit } from '@angular/core';

import {
  FileManagerService,
  StoreType,
} from 'src/app/services/file-manager.service';
import { IFileEntity } from 'src/app/interfaces/file-management';
import { ReadyState } from 'src/app/classes/readyable';

@Component({
  selector: 'gup-file-manager',
  templateUrl: './file-manager.component.html',
  styleUrls: ['./file-manager.component.scss'],
})
export class FileManagerComponent implements OnInit {
  ready = false;
  loading = true;

  sortedFiles: StoreType = [];

  constructor(readonly fileManager: FileManagerService) {
    console.debug(
      'FileManagerComponent:',
      fileManager,
      fileManager.currentState
    );
    if (this.fileManager.isReady) {
      this.ready = true;
      this.loading = false;
    } else {
      this.fileManager.observeReadyFinalize().subscribe((state) => {
        console.debug('fileManager finalized:', state);
        this.loading = false;
        this.ready = state === ReadyState.Ready;
      });
    }

    this.fileManager.sortedStore.subscribe((data) => {
      console.debug('received new sorted files');
      this.sortedFiles = data;
    });
  }

  ngOnInit(): void {}

  refresh() {
    if (this.loading) {
      return;
    }
    this.loading = true;
    this.fileManager.refresh().finally(() => (this.loading = false));
  }
}
