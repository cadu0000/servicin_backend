export interface ServiceFiltersDTO {
  providerName?: string;
  minPrice?: number;
  maxPrice?: number;
  category?: string;
  latitude?: number;
  longitude?: number;
  radiusKm?: number;
  chargeType?: string;
  minRating?: number;
}
