import { TestBed, inject } from '@angular/core/testing';

import { MemoizerService } from './memoizer.service';

describe('MemoizerService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MemoizerService]
    });
  });

  it('should be created', inject([MemoizerService], (service: MemoizerService) => {
    expect(service).toBeTruthy();
  }));
});
