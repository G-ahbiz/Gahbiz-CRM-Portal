import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalesCrm } from './sales-crm';

describe('SalesCrm', () => {
  let component: SalesCrm;
  let fixture: ComponentFixture<SalesCrm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SalesCrm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SalesCrm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
