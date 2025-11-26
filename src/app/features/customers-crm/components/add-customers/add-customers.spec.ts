import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddCustomers } from './add-customers';

describe('AddCustomers', () => {
  let component: AddCustomers;
  let fixture: ComponentFixture<AddCustomers>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddCustomers]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddCustomers);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
