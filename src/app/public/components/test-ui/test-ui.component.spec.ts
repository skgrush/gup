import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TestUiComponent } from './test-ui.component';

describe('TestUiComponent', () => {
  let component: TestUiComponent;
  let fixture: ComponentFixture<TestUiComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TestUiComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestUiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
