import { z } from 'zod';

export const PublicSearchQuerySchema = z.object({
    q: z.string().optional(),
    providerName: z.string().optional(),
    axis: z.string().optional(),
    chargeType: z.string().optional(),
    
    minPrice: z.coerce.number().min(0).optional(),
    maxPrice: z.coerce.number().min(0).optional(),
    minRating: z.coerce.number().min(0).max(5).optional(),

    latitude: z.coerce.number().optional(),
    longitude: z.coerce.number().optional(),
    radiusKm: z.coerce.number().min(1).optional(),
});

export type PublicSearchQueryType = z.infer<typeof PublicSearchQuerySchema>;