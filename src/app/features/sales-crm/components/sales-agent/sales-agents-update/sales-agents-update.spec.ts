import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalesAgentsUpdate } from './sales-agents-update';

describe('SalesAgentsUpdate', () => {
  let component: SalesAgentsUpdate;
  let fixture: ComponentFixture<SalesAgentsUpdate>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SalesAgentsUpdate],
    }).compileComponents();

    fixture = TestBed.createComponent(SalesAgentsUpdate);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
