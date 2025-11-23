import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TabsHeader } from './tabs-header';

describe('TabsHeader', () => {
  let component: TabsHeader;
  let fixture: ComponentFixture<TabsHeader>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TabsHeader]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TabsHeader);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
