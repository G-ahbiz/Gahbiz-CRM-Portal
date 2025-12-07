export interface OrderListItem {
  id: string;
  userId: string;
  amount: number;
  status: string;
  createdDate: string;
  address: string;

  selected?: boolean;
  [key: string]: any;
}