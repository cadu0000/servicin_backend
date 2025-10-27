import MOCK_SERVICES from '../data/service.mock';; 

export class ServiceRepository {
    async search(searchTerm: string) {
        if (!searchTerm || searchTerm.trim().length < 2) {
            return [];
        }

        const term = searchTerm.toLowerCase().trim();

        const results = MOCK_SERVICES.filter(service => {
            const nameMatch = service.name.toLowerCase().includes(term);
            const axisMatch = service.axis.toLowerCase().includes(term);

            return nameMatch || axisMatch;
        });

        return results;
    }
}