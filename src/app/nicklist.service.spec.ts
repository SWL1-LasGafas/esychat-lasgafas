import { TestBed } from '@angular/core/testing';

import { NicklistService } from './nicklist.service';

describe('NicklistService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: NicklistService = TestBed.get(NicklistService);
    expect(service).toBeTruthy();
  });
});
