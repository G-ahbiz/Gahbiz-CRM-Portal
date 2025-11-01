import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrdersTabel } from './orders-tabel';

describe('OrdersTabel', () => {
  let component: OrdersTabel;
  let fixture: ComponentFixture<OrdersTabel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrdersTabel]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrdersTabel);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
