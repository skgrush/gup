import { Injectable } from '@angular/core';
import { Subject, BehaviorSubject } from 'rxjs';

export interface ITabInfo {
  readonly labelId: string;
  readonly panelId: string;
  readonly selected: boolean;
}

interface ITabPanel {
  readonly tabName?: string;
}

@Injectable({
  providedIn: 'root',
})
export class TabService {
  private _panelToMap = new WeakMap<ITabPanel, ITabInfo>();

  private _updatedSubject = new BehaviorSubject(this._panelToMap);

  get updatedAsObservable() {
    return this._updatedSubject.asObservable();
  }

  constructor() {}

  registerMultiple(
    panels: ITabPanel[],
    idBaseBase: string,
    selectedTab?: string
  ) {
    for (let i = 0; i < panels.length; ++i) {
      this._register(
        panels[i],
        `${idBaseBase}-${i}`,
        !!selectedTab && panels[i].tabName === selectedTab
      );
    }
    this._updatedSubject.next(this._panelToMap);
  }

  updateMultipleSelections(panels: ITabPanel[], selectedTab?: string) {
    for (const panel of panels) {
      const selected = !!selectedTab && panel.tabName === selectedTab;
      const info = this._panelToMap.get(panel);
      if (info) {
        const newInfo = Object.assign({}, info, { selected });
        this._panelToMap.set(panel, newInfo);
      }
    }
    this._updatedSubject.next(this._panelToMap);
  }

  register(panel: ITabPanel, idBase: string, selected: boolean) {
    this._register(panel, idBase, selected);
    this._updatedSubject.next(this._panelToMap);
  }

  private _register(panel: ITabPanel, idBase: string, selected: boolean) {
    const info: ITabInfo = {
      labelId: `${idBase}-tab`,
      panelId: `${idBase}-panel`,
      selected,
    };
    this._panelToMap.set(panel, info);
  }
}
