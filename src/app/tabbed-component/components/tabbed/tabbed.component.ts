import {
  Component,
  OnInit,
  ContentChildren,
  TemplateRef,
  Input,
  QueryList,
  EventEmitter,
  Output,
  AfterViewInit,
} from '@angular/core';
import { TabPanelComponent } from '../tab-panel/tab-panel.component';
import { TabService } from '../../services/tab.service';

@Component({
  selector: 'gup-tabbed',
  templateUrl: './tabbed.component.html',
  styleUrls: ['./tabbed.component.scss'],
})
export class TabbedComponent implements AfterViewInit {
  @Input()
  id!: string;

  @Input()
  defaultSelection?: string;

  @Output()
  tabSelected = new EventEmitter<string>();

  @ContentChildren(TabPanelComponent)
  tabPanels!: QueryList<TabPanelComponent>;

  selectedTab?: string;

  constructor(readonly tabService: TabService) {}

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.selectedTab = this.defaultSelection;
      this.tabService.registerMultiple(
        this.tabPanels.toArray(),
        this.id,
        this.selectedTab
      );
    });
  }

  selectTab(e: Event, name: string) {
    e.preventDefault();
    if (this.selectedTab !== name) {
      this.selectedTab = name;
      this.tabService.updateMultipleSelections(
        this.tabPanels.toArray(),
        this.selectedTab
      );
      this.tabSelected.emit(name);
      return false;
    }
  }

  tabIsSelected(tabName: string) {
    return this.selectedTab === tabName;
  }
}
