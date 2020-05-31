import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TabbedComponent } from './components/tabbed/tabbed.component';
import { TabComponent } from './components/tab/tab.component';
import { TabPanelComponent } from './components/tab-panel/tab-panel.component';
import { TabService } from './services/tab.service';

@NgModule({
  declarations: [TabbedComponent, TabComponent, TabPanelComponent],
  imports: [CommonModule],
  exports: [TabbedComponent, TabPanelComponent],
  providers: [TabService],
})
export class TabbedComponentModule {}
