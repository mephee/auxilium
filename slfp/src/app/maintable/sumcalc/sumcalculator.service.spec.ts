import { TestBed, inject } from '@angular/core/testing';

import { SumcalculatorService } from './sumcalculator.service';

describe('SumcalculatorService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SumcalculatorService]
    });
  });

  it('should be created', inject([SumcalculatorService], (service: SumcalculatorService) => {
    expect(service).toBeTruthy();
  }));
});
