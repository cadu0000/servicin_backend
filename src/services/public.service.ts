import { ServiceRepository } from '../repository/service.repository';
import { ServiceFiltersDTO } from '../core/dtos/ServiceFiltersDTO';
import { InvalidInputError } from '../core/errors/InvalidInputError';

export interface InputFilters extends ServiceFiltersDTO { 
    q?: string; 
}

interface RepositoryFilters extends ServiceFiltersDTO { 
    searchTerm?: string; 
}

export class PublicSearchService {
    private serviceRepository: ServiceRepository;

    constructor(serviceRepository: ServiceRepository) {
        this.serviceRepository = serviceRepository;
    }

    async execute(filters: InputFilters) { 
        const repositoryFilters: RepositoryFilters = {}; 

        const rawTerm = filters.q;
        const term = rawTerm && typeof rawTerm === 'string' ? rawTerm.trim() : '';
        
        if (term.length > 0 && term.length <= 2) {
            throw new InvalidInputError("O termo de busca deve ter pelo menos 2 caracteres.");
        }

        if (term.length >= 2) {
            repositoryFilters.searchTerm = term;

            if (filters.q) {
                delete (filters as any).axis; 
            }
        }
        
        for (const key in filters) {
            if (key !== 'q' && (filters as any)[key] !== undefined) {
                (repositoryFilters as any)[key] = (filters as any)[key];
            }
        }

        const services = await this.serviceRepository.filterServices(repositoryFilters); 
        return services;
    }
}