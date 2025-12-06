import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrdersContent } from './orders-content';

describe('OrdersContent', () => {
  let component: OrdersContent;
  let fixture: ComponentFixture<OrdersContent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrdersContent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrdersContent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
