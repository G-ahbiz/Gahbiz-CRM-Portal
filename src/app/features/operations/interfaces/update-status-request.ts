import { ClientServiceStatus } from "@shared/config/constants";

export interface UpdateStatusRequest {
  status: ClientServiceStatus;
  note: string;
}
