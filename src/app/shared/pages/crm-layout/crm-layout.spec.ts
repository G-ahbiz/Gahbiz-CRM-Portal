import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrmLayout } from './crm-layout';

describe('CrmLayout', () => {
  let component: CrmLayout;
  let fixture: ComponentFixture<CrmLayout>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrmLayout]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CrmLayout);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
