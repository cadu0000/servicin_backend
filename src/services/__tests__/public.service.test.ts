import { PublicSearchService } from '../public.service';
import { InvalidInputError } from '../../core/errors/InvalidInputError';
import { ServiceRepository } from '../../repository/service.repository'; 
import { InputFilters } from '../public.service';

const mockServiceRepository: jest.Mocked<ServiceRepository> = {
    filterServices: jest.fn(), 
};

const MOCK_SERVICE_RESULT = {
    id: 's1', 
    name: 'Serviço de Teste', 
    axis: 'Teste', 
    description: 'Teste', 
    price: 100, 
    providerName: 'Provider Teste', 
    chargeType: 'Fixo', 
    averageRating: 5.0, 
    latitude: 0, 
    longitude: 0 
};

describe('PublicSearchService', () => {
    let publicSearchService: PublicSearchService;

    beforeEach(() => {
        jest.clearAllMocks(); 
        publicSearchService = new PublicSearchService(mockServiceRepository);
    });

    describe('Validation and Exceptions', () => {
        
        it('should throw InvalidInputError for search terms less than 2 characters', async () => {
            const invalidTermFilters = { q: 'a' };

            await expect(publicSearchService.execute(invalidTermFilters)).rejects.toThrow(InvalidInputError);
            
            await expect(publicSearchService.execute(invalidTermFilters)).rejects.toThrow('O termo de busca deve ter pelo menos 2 caracteres.');
            
            expect(mockServiceRepository.filterServices).not.toHaveBeenCalled();
        });

        it('should NOT throw an error for empty search term (q is undefined)', async () => {
            const emptyFilters = {};
            
            mockServiceRepository.filterServices.mockResolvedValue([]); 

            await expect(publicSearchService.execute(emptyFilters)).resolves.not.toThrow();
            expect(mockServiceRepository.filterServices).toHaveBeenCalled();
        });
    });

    describe('Mapping and Repository Interaction', () => {
        
        const mockResults = [MOCK_SERVICE_RESULT]; 

        beforeEach(() => {
            mockServiceRepository.filterServices.mockResolvedValue(mockResults);
        });

        it('should correctly map the "q" parameter to "searchTerm" in the repository call', async () => {
            const inputFilters = { q: 'Limpeza' };
            await publicSearchService.execute(inputFilters);

            expect(mockServiceRepository.filterServices).toHaveBeenCalledWith({
                searchTerm: 'Limpeza', 
            });
        });

        it('should pass all valid DTO filters to the repository when q is NOT present', async () => {
            const inputFilters: InputFilters = { minRating: 4.5, providerName: 'João' };
            await publicSearchService.execute(inputFilters);
        });

        it('should prevent the specific "axis" filter from being passed when "q" is present (Conflict resolution)', async () => {
            const inputFilters = { q: 'Limpeza', axis: 'Serviços' };
            await publicSearchService.execute(inputFilters);

            expect(mockServiceRepository.filterServices).toHaveBeenCalledWith(
                expect.objectContaining({
                    searchTerm: 'Limpeza',
                })
            );
            
            expect(mockServiceRepository.filterServices).not.toHaveBeenCalledWith(
                expect.objectContaining({
                    axis: 'Serviços',
                })
            );
        });

        it('should trim the search term before sending to the repository', async () => {
            const inputFilters = { q: '  termo com espaços  ' };
            await publicSearchService.execute(inputFilters);

            expect(mockServiceRepository.filterServices).toHaveBeenCalledWith({
                searchTerm: 'termo com espaços',
            });
        });
    });
});