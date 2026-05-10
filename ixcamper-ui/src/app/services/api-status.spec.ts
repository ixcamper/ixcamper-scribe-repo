import { TestBed } from '@angular/core/testing';

import { ApiStatus } from './api-status';

describe('ApiStatus', () => {
  let service: ApiStatus;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ApiStatus);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
