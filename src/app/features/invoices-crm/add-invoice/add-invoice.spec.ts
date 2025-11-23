import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddInvoice } from './add-invoice';

describe('AddInvoice', () => {
  let component: AddInvoice;
  let fixture: ComponentFixture<AddInvoice>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddInvoice]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddInvoice);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
