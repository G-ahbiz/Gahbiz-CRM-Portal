import { TestBed } from '@angular/core/testing';

import { AllServices } from './all-services';

describe('AllServices', () => {
  let service: AllServices;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AllServices);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
