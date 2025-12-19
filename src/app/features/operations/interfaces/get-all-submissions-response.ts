import { ServiceFileGroup } from './service-file';

export type SubmissionStatus =
  | 'Created'
  | 'Submitted'
  | 'UnderReview'
  | 'PendingClientAction'
  | 'InProgress'
  | 'Verified'
  | 'Completed'
  | 'Cancelled'
  | 'Rejected';

export interface ServiceSubmission {
  submissionId: string;
  customerName: string;
  serviceName: string;
  slaDeadline: string;
  lastUpdated: string;
  uploadedDocumentsCount: number;
  status: SubmissionStatus;
  serviceId: string;
  orderId: string;
  userId: string;
  branchId: string;
  jsonData: string;
  createdDate: string;
  fulfillmentDate: string;
  fulfillmentDuration: string;
  serviceFiles: ServiceFileGroup[];
}
