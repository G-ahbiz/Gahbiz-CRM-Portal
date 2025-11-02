import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalesAgents } from './sales-agents';

describe('SalesAgents', () => {
  let component: SalesAgents;
  let fixture: ComponentFixture<SalesAgents>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SalesAgents]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SalesAgents);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
