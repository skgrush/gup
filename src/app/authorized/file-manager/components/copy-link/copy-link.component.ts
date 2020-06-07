import { Component, Input, HostBinding, HostListener } from '@angular/core';
import { LoggerService } from 'src/app/gup-common/services/logger/logger.service';

@Component({
  selector: 'gup-copy-link',
  templateUrl: './copy-link.component.html',
  styleUrls: ['./copy-link.component.scss'],
})
export class CopyLinkComponent {
  private static _permissionsGranted?: boolean;

  @Input()
  url?: string;

  @HostBinding('style.display')
  get display() {
    return this.url && CopyLinkComponent._permissionsGranted !== false
      ? 'inline-block'
      : 'none';
  }

  @HostBinding('attr.aria-label')
  readonly ariaLabel = 'Copy URL';

  constructor(private readonly _logger: LoggerService) {}

  @HostListener('click')
  async onClick() {
    if (!this.url || !(await this.checkPermissions())) {
      return;
    }

    await window.navigator.clipboard.writeText(this.url);
    this._logger.log('Successfully copied link to clipboard');
  }

  async checkPermissions(): Promise<boolean> {
    if (CopyLinkComponent._permissionsGranted !== undefined) {
      return CopyLinkComponent._permissionsGranted;
    } else {
      let granted: boolean;
      if (window.navigator.clipboard) {
        if (!window.navigator.permissions) {
          granted = true;
        } else {
          try {
            const result = await window.navigator.permissions.query({
              name: 'clipboard-write',
            } as any);
            this._logger.log('CopyLink permission queried:', result.state);
            granted = result.state !== 'denied';
          } catch (ex) {
            this._logger.error('failed to access permissions', [ex]);
            granted = false;
          }
        }
      } else {
        granted = false;
      }

      CopyLinkComponent._permissionsGranted = granted;
      return granted;
    }
  }
}
