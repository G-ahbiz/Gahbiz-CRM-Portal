import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InvoicesCrm } from './invoices-crm';

describe('InvoicesCrm', () => {
  let component: InvoicesCrm;
  let fixture: ComponentFixture<InvoicesCrm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InvoicesCrm],
    }).compileComponents();

    fixture = TestBed.createComponent(InvoicesCrm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
