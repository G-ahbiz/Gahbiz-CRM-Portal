export interface StatisticsResponse {
  totalOrders: number;
  confirmedOrders: number;
  pendingOrders: number;
  cancelledOrders: number;
  totalChangePercentage: number;
  confirmedChangePercentage: number;
  pendingChangePercentage: number;
  cancelledChangePercentage: number;
}
