import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomersContent } from './customers-content';

describe('CustomersContent', () => {
  let component: CustomersContent;
  let fixture: ComponentFixture<CustomersContent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomersContent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomersContent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
