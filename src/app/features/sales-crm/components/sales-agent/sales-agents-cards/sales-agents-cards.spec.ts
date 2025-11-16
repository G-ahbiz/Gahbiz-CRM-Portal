import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalesAgentsCards } from './sales-agents-cards';

describe('SalesAgentsCards', () => {
  let component: SalesAgentsCards;
  let fixture: ComponentFixture<SalesAgentsCards>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SalesAgentsCards]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SalesAgentsCards);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
