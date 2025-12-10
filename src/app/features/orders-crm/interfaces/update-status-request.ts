import { OrderStatus } from "../type/order-status.enum";

export interface UpdateStatusRequest {
  status: OrderStatus;
  note: string;
}
