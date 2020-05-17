import {
  Component,
  OnInit,
  ContentChildren,
  TemplateRef,
  Input,
  QueryList,
  EventEmitter,
  Output,
} from '@angular/core';

@Component({
  selector: 'gup-tabbed',
  templateUrl: './tabbed.component.html',
  styleUrls: ['./tabbed.component.scss'],
})
export class TabbedComponent implements OnInit {
  @Input()
  defaultSelection?: string;

  @Input()
  tabNames: string[] = [];

  @Output()
  tabSelected = new EventEmitter<string>();

  @ContentChildren(TemplateRef, { read: TemplateRef })
  tabs!: QueryList<TemplateRef<any>>;

  selectedTab?: string;

  constructor() {}

  ngOnInit(): void {
    if (this.defaultSelection) {
      this.selectedTab = this.defaultSelection;
    }
  }

  selectTab(e: Event, name: string) {
    e.preventDefault();
    if (this.selectedTab !== name) {
      this.selectedTab = name;
      this.tabSelected.emit(name);
      return false;
    }
  }

  tabIsHidden(idx: number) {
    return this.tabNames[idx] !== this.selectedTab;
  }
}
