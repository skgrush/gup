import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FileDetailsComponent } from './file-details.component';

describe('FileDetailsComponent', () => {
  let component: FileDetailsComponent;
  let fixture: ComponentFixture<FileDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FileDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FileDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
