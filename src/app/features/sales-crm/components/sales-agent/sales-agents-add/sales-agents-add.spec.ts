import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalesAgentsAdd } from './sales-agents-add';

describe('SalesAgentsAdd', () => {
  let component: SalesAgentsAdd;
  let fixture: ComponentFixture<SalesAgentsAdd>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SalesAgentsAdd]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SalesAgentsAdd);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
