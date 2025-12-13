import { ApiImage } from '@core/interfaces/api-image';
import { ServiceFileGroup } from './service-file';

export interface GetSubmissionDetails {
  id: string;
  serviceId: string;
  operationAgentId: string;
  userId: string;
  providerId: string | null;
  orderId: string;
  branchId: string;
  jsonData: string;
  status: string;
  createdDate: string;
  fulfillmentDate: string;
  fulfillmentDuration: string;
  files: ApiImage[];
  serviceFiles: ServiceFileGroup[];
}
