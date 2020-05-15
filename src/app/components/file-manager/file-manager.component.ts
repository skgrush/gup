import { Component, OnInit } from '@angular/core';

import {
  FileManagerService,
  StoreType,
} from 'src/app/services/file-manager.service';
import { ReadyState } from 'src/app/classes/readyable';
import { FEMovableKeyType } from 'src/app/enums/file-entity-headers.enum';

@Component({
  selector: 'gup-file-manager',
  templateUrl: './file-manager.component.html',
  styleUrls: ['./file-manager.component.scss'],
})
export class FileManagerComponent implements OnInit {
  ready = false;
  loading = true;

  sortedFiles: StoreType = [];

  columnOrder = [] as FEMovableKeyType[];

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
    this.fileManager.columnOrder.subscribe((cols) => {
      this.columnOrder = cols;
    });
  }

  ngOnInit(): void {}

  refresh() {
    if (this.loading) {
      return;
    }
    this.loading = true;
    this.fileManager.refreshFileStore().finally(() => (this.loading = false));
  }
}
