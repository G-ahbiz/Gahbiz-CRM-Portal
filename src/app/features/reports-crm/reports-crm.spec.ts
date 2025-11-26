import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportsCrm } from './reports-crm';

describe('ReportsCrm', () => {
  let component: ReportsCrm;
  let fixture: ComponentFixture<ReportsCrm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportsCrm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReportsCrm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
