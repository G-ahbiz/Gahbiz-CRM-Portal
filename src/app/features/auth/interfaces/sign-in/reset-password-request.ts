export interface ResetPasswordRequest {
  userId: string;
  otp: string;
  token: string;
  newPassword: string;
  confirmPassword: string;
}
