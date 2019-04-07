import { TestBed } from '@angular/core/testing';

import { SpecialService } from './special.service';

describe('SpecialService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SpecialService = TestBed.get(SpecialService);
    expect(service).toBeTruthy();
  });
});
