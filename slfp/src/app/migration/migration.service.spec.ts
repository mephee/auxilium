import { TestBed, inject } from '@angular/core/testing';

import { MigrationService } from './migration.service';

describe('MigrationService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MigrationService]
    });
  });

  it('should be created', inject([MigrationService], (service: MigrationService) => {
    expect(service).toBeTruthy();
  }));
});
