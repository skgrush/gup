import { Component, Input, HostBinding } from '@angular/core';
import { TabService } from '../../services/tab.service';

@Component({
  selector: 'gup-tab-panel',
  template: `<ng-content></ng-content>`,
  styleUrls: ['./tab-panel.component.scss'],
})
export class TabPanelComponent {
  @Input()
  tabName?: string;

  @HostBinding('style.display')
  get display() {
    return this.selected ? 'block' : 'none';
  }

  @HostBinding('attr.id')
  id?: string;

  @HostBinding('attr.aria-labelledby')
  tabId?: string;

  @HostBinding('attr.role')
  readonly role = 'tabpanel';

  selected?: boolean;

  constructor(readonly tabService: TabService) {
    this.tabService.updatedAsObservable.subscribe((map) => {
      const info = map.get(this);
      this.id = info?.panelId;
      this.tabId = info?.labelId;
      this.selected = info?.selected;
    });
  }
}
