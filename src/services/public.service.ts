import { ServiceRepository } from '../repository/service.repository';

export class PublicSearchService {
    private serviceRepository: ServiceRepository;

    constructor(serviceRepository: ServiceRepository) {
        this.serviceRepository = serviceRepository;
    }

    async execute(rawTerm: string | undefined) {
        const term = rawTerm ? rawTerm.trim() : '';

        if (term.length < 2) {
             return [];
        }

        const services = await this.serviceRepository.search(term);

        return services;
    }
}