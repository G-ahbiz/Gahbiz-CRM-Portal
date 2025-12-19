export interface UpdateStatusResponse {
  clientServiceId: string;
  oldStatus: string;
  newStatus: string;
  note: string;
  updatedAt: string;
  userId: string;
  name: string;
  role: string;
  transaction: {
    id: string;
    serviceId: string;
    userId: string;
    note: string;
    date: string;
    status: string;
    files: any[];
  };
}
