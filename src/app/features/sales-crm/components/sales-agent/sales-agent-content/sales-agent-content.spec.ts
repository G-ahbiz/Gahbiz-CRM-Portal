import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalesAgentContent } from './sales-agent-content';

describe('SalesAgentContent', () => {
  let component: SalesAgentContent;
  let fixture: ComponentFixture<SalesAgentContent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SalesAgentContent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SalesAgentContent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
