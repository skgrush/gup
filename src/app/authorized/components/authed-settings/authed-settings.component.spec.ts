import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthedSettingsComponent } from './authed-settings.component';

describe('AuthedSettingsComponent', () => {
  let component: AuthedSettingsComponent;
  let fixture: ComponentFixture<AuthedSettingsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AuthedSettingsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AuthedSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
