import { TestBed } from '@angular/core/testing';

import { EnvConfigService } from './env-config.service';

describe('ConfigService', () => {
  let service: EnvConfigService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EnvConfigService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
