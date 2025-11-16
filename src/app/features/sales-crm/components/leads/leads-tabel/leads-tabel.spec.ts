import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeadsTabel } from './leads-tabel';

describe('LeadsTabel', () => {
  let component: LeadsTabel;
  let fixture: ComponentFixture<LeadsTabel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LeadsTabel]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LeadsTabel);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
