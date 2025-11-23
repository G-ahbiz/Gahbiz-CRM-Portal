import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvoicesTabel } from './invoices-tabel';

describe('InvoicesTabel', () => {
  let component: InvoicesTabel;
  let fixture: ComponentFixture<InvoicesTabel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InvoicesTabel]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InvoicesTabel);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
