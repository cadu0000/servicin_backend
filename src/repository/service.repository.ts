import MOCK_SERVICES from '../data/service.mock';
import { ServiceFiltersDTO } from '../core/dtos/ServiceFiltersDTO';

interface FilterParams extends ServiceFiltersDTO {
    searchTerm?: string; 
}

export class ServiceRepository {
    async filterServices(filters: FilterParams) {
        let results = MOCK_SERVICES;

        if (filters.searchTerm && filters.searchTerm.trim().length >= 2) {
            const term = filters.searchTerm.toLowerCase().trim();

            results = results.filter(service => {
                const nameMatch = service.name.toLowerCase().includes(term);
                const axisMatch = service.axis.toLowerCase().includes(term);
                return nameMatch || axisMatch;
            });
            
        }

        if (filters.minRating !== undefined) {
            results = results.filter(service => 
                service.averageRating >= filters.minRating!
            );
        }

        if (filters.providerName) {
            const name = filters.providerName.toLowerCase();
            results = results.filter(service => 
                service.providerName && service.providerName.toLowerCase().includes(name)
            );
        }

        if (filters.axis) {
            const axisTerm = filters.axis.toLowerCase();
            results = results.filter(service => 
                service.axis.toLowerCase() === axisTerm
            );
        }
        
        if (filters.minPrice !== undefined) {
            results = results.filter(service => service.price >= filters.minPrice!);
        }
        if (filters.maxPrice !== undefined) {
            results = results.filter(service => service.price <= filters.maxPrice!);
        }
        
        if (filters.chargeType) {
            const type = filters.chargeType.toLowerCase();
            results = results.filter(service => 
                service.chargeType.toLowerCase() === type
            );
        }

        return Promise.resolve(results); 
    }
}