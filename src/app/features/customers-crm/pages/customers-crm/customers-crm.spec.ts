import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomersCrm } from './customers-crm';

describe('CustomersCrm', () => {
  let component: CustomersCrm;
  let fixture: ComponentFixture<CustomersCrm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomersCrm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomersCrm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
