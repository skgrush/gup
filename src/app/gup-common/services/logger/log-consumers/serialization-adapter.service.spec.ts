import { TestBed } from '@angular/core/testing';

import { SerializationAdapterService } from './serialization-adapter.service';

describe('SerializationAdapterService', () => {
  let service: SerializationAdapterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SerializationAdapterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
