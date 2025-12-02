import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvoiceContent } from './invoice-content';

describe('InvoiceContent', () => {
  let component: InvoiceContent;
  let fixture: ComponentFixture<InvoiceContent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InvoiceContent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InvoiceContent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
