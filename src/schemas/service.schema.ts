import { z } from 'zod';

export const PublicSearchQuerySchema = z.object({
    q: z.string().optional().describe('Unique service ID'),
    providerName: z.string().optional().describe('Service Provider Name'),
    axis: z.string().optional().describe('Service axis'),
    chargeType: z.string().optional().describe('Billing type'),
    
    minPrice: z.coerce.number().min(0).optional().describe('Minimum price the solicitor is willing to pay'),
    maxPrice: z.coerce.number().min(0).optional().describe('Maximum price the solicitor is willing to pay'),
    minRating: z.coerce.number().min(0).max(5).optional().describe('Average rating of services provided (1.0 to 5.0)'),

    latitude: z.coerce.number().optional().describe('Location latitude'),
    longitude: z.coerce.number().optional().describe('Location longitude'),
    radiusKm: z.coerce.number().min(1).optional().describe('Square kilometer radio'),
});

export type PublicSearchQueryType = z.infer<typeof PublicSearchQuerySchema>;