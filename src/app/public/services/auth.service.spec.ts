import { TestBed } from '@angular/core/testing';

import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthService);
    (service as any)._keyStore._storage = sessionStorage;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
