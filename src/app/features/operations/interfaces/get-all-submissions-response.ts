import { ApiImage } from '@core/interfaces/api-image';

export type SubmissionStatus =
  | 'Created'
  | 'Submitted'
  | 'UnderReview'
  | 'PendingClientAction'
  | 'InProgress'
  | 'Verified'
  | 'Completed'
  | 'Cancelled';

export interface ServiceTransaction {
  id: string;
  serviceId: string;
  clientServiceId: string;
  userId: string;
  note: string;
  date: string;
  status: SubmissionStatus;
  files: ApiImage[];
}

export interface ServiceFileGroup {
  id: string;
  serviceFileId: string;
  userId: string;
  serviceSubmissionId: string;
  files: ApiImage[];
  createdDate: string;
  note: string;
}

export interface ServiceSubmission {
  // table columns
  id: string;
  userName: string;
  serviceName: string;
  fulfillmentDate: string;
  lastUpdatedDate: string;
  status: SubmissionStatus;

  operationAgentId: string;
  providerId: string;
  orderId: string;
  branchId: string;
  jsonData: string;
  createdDate: string;
  fulfillmentDuration: string;
  serviceTransactions: ServiceTransaction[];
  files: ApiImage[];
  serviceFiles: ServiceFileGroup[];
}
