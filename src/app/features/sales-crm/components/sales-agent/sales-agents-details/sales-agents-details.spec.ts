import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalesAgentsDetails } from './sales-agents-details';

describe('SalesAgentsDetails', () => {
  let component: SalesAgentsDetails;
  let fixture: ComponentFixture<SalesAgentsDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SalesAgentsDetails]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SalesAgentsDetails);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
