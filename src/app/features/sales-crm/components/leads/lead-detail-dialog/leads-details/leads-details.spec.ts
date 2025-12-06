import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeadsDetails } from './leads-details';

describe('LeadsDetails', () => {
  let component: LeadsDetails;
  let fixture: ComponentFixture<LeadsDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LeadsDetails]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LeadsDetails);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
