import { TestBed } from '@angular/core/testing';

import { ConsoleAdapterService } from './console-adapter.service';

describe('ConsoleAdapterService', () => {
  let service: ConsoleAdapterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ConsoleAdapterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
