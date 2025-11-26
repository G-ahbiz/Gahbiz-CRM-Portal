import { ApiImage } from '@core/interfaces/api-image';

export interface ServiceDetails {
  id: string;
  name: string;
  description: string;
  price: number;
  priceBefore: number;
  deliveryTime: number;
  deliveryTimeRate: string;
  deliveryType: string;
  currency: string;
  categoryId: string;
  image: ApiImage | null;
  active: boolean;
  rate: number;
  rateCount: number;
  tags: string | null;
}
