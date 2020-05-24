import { Component, Input, HostBinding, HostListener } from '@angular/core';

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

  @HostListener('click')
  async onClick() {
    if (!this.url || !(await this.checkPermissions())) {
      return;
    }

    await window.navigator.clipboard.writeText(this.url);
    console.log('Successfully copied link to clipboard');
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
            granted = result.state !== 'denied';
          } catch (ex) {
            console.warn('failed to access permissions', [ex]);
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
