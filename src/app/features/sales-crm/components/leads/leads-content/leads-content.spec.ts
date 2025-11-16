import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeadsContent } from './leads-content';

describe('LeadsContent', () => {
  let component: LeadsContent;
  let fixture: ComponentFixture<LeadsContent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LeadsContent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LeadsContent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
