import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerTabel } from './customer-tabel';

describe('CustomerTabel', () => {
  let component: CustomerTabel;
  let fixture: ComponentFixture<CustomerTabel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomerTabel]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomerTabel);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
