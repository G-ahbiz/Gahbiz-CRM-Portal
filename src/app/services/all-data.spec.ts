import { TestBed } from '@angular/core/testing';

import { AllData } from './all-data';

describe('AllData', () => {
  let service: AllData;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AllData);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
