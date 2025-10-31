import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrmDashboard } from './crm-dashboard';

describe('CrmDashboard', () => {
  let component: CrmDashboard;
  let fixture: ComponentFixture<CrmDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrmDashboard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CrmDashboard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
