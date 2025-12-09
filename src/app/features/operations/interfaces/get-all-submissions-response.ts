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

export interface ServiceFileGroup {
  id: string;
  serviceFileId: string;
  serviceFileName: string;
  userId: string;
  serviceSubmissionId: string;
  files: ApiImage[];
  createdDate: string;
  note: string;
}

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
