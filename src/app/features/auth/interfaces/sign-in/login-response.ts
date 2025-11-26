import { TokenData } from '@core/interfaces/token-data';
import { User } from './user';

export interface LoginResponse {
  token: TokenData;
  user: User;
}
