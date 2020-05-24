import { Component, Input, HostBinding } from '@angular/core';
import { TabPanelComponent } from '../tab-panel/tab-panel.component';
import { TabService } from '../../services/tab.service';

@Component({
  selector: 'gup-tab',
  template: `<ng-content></ng-content>`,
  styleUrls: ['./tab.component.scss'],
})
export class TabComponent {
  @Input()
  controls?: TabPanelComponent;

  @HostBinding('attr.id')
  id?: string;

  @HostBinding('attr.role')
  readonly role = 'tab';

  @HostBinding('attr.aria-selected')
  selected?: boolean;

  @HostBinding('attr.aria-controls')
  panelId?: string;

  constructor(readonly tabService: TabService) {
    this.tabService.updatedAsObservable.subscribe((map) => {
      console.debug('tab update?');
      if (this.controls) {
        const info = map.get(this.controls);
        this.id = info?.labelId;
        this.panelId = info?.panelId;
        this.selected = info?.selected;
      }
    });
  }

  ngOnInit() {}

  // ngOnInit(): void {
  //   console.debug('tab.ngOnInit:', this, this.controls);
  //   if (this.controls) {
  //     this.controls.labelledBy = this;
  //   }
  // }
}
