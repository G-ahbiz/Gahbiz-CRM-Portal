import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeadsAdd } from './leads-add';

describe('LeadsAdd', () => {
  let component: LeadsAdd;
  let fixture: ComponentFixture<LeadsAdd>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LeadsAdd]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LeadsAdd);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
