import { Component } from '@angular/core';

import { FileManagerService, StoreType } from './services/file-manager.service';
import { ReadyState } from 'src/app/shared/classes/readyable';
import { FEMovableKeyType } from './enums/file-entity-headers.enum';
import {
  IFileFormValue,
  IUrlFormValue,
  IFileEntityHeaded,
  IFileEntity,
} from './interfaces/file-management';
import { LoggerService } from 'src/app/gup-common/services/logger/logger.service';

@Component({
  selector: 'gup-file-manager',
  templateUrl: './file-manager.component.html',
  styleUrls: ['./file-manager.component.scss'],
})
export class FileManagerComponent {
  ready = false;
  loading = true;

  selectedFile?: IFileEntityHeaded;

  sortedFiles: StoreType = [];

  columnOrder = [] as FEMovableKeyType[];

  constructor(
    readonly fileManager: FileManagerService,
    private readonly _logger: LoggerService
  ) {
    _logger.initialize('FileManager', 'component', this);
    this.fileManager.observeReadyFinalize().subscribe((state) => {
      this.loading = false;
      this.ready = state === ReadyState.Ready;
    });

    this.fileManager.sortedStore.subscribe((data) => {
      _logger.debug('received new sorted files');
      this.sortedFiles = data;
      this.selectedFile = undefined;
    });
    this.fileManager.columnOrder.subscribe((cols) => {
      this.columnOrder = cols;
    });
  }

  refresh() {
    if (this.loading) {
      this._logger.warn(
        'Ignoring call to FileManagerComponent#refresh mid-refresh'
      );
      return;
    }
    this.loading = true;
    this.fileManager.refreshFileStore().finally(() => (this.loading = false));
  }

  selectFile(file?: IFileEntityHeaded) {
    this.selectedFile = file;
  }

  async deleteFile(file?: IFileEntity) {
    if (!file) {
      return;
    }
    this._logger.info('Delete file:', file);
    await this.fileManager.deleteFile(file);

    this.selectFile();
  }

  async onFileSubmit(formVal: IFileFormValue) {
    this._logger.debug('onFileSubmit', formVal);
    try {
      const managed = await this.fileManager.uploadFile(formVal);
      formVal.progress({ success: true });
    } catch (exc) {
      formVal.progress({ success: false, error: `${exc}` });
      throw exc;
    }
  }

  async onUrlSubmit(formVal: IUrlFormValue) {
    this._logger.debug('onUrlSubmit', formVal);
    try {
      const managed = await this.fileManager.uploadUrl(formVal);
      formVal.progress({ success: true });
    } catch (exc) {
      formVal.progress({ success: false, error: `${exc}` });
      throw exc;
    }
  }
}
