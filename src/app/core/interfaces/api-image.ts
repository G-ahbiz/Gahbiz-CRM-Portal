export interface ApiImage {
  path: string;
  name: string;
  guidName: string;
  type: string;
  error: boolean;
  isSelected: boolean;
  delete: boolean;
  message: string | null;
}
