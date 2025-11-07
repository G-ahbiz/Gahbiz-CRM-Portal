import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalesAgentsTabel } from './sales-agents-tabel';

describe('SalesAgentsTabel', () => {
  let component: SalesAgentsTabel;
  let fixture: ComponentFixture<SalesAgentsTabel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SalesAgentsTabel]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SalesAgentsTabel);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
