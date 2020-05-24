import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TotpQrPopupComponent } from './totp-qr-popup.component';

describe('TotpQrPopupComponent', () => {
  let component: TotpQrPopupComponent;
  let fixture: ComponentFixture<TotpQrPopupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TotpQrPopupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TotpQrPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
