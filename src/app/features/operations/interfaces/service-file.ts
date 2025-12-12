import { ApiImage } from '@core/interfaces/api-image';

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
