import { ServiceService, InputFilters } from '../service.service';
import { InvalidInputError } from '../../core/errors/InvalidInputError';
import { ServiceRepository } from '../../repository/service.repository'; 
import { UserRepository } from '../../repository/user.repository';

const mockServiceRepository: jest.Mocked<ServiceRepository> = {
    filterServices: jest.fn(),
    fetch: jest.fn(),
    fetchById: jest.fn(),
    create: jest.fn(),
    findCategoryById: jest.fn(),
};

const mockUserRepository: jest.Mocked<UserRepository> = {
    findById: jest.fn(), 
    findServiceProviderByUserId: jest.fn(),
    findByEmail: jest.fn(),
    findIndividualByCPF: jest.fn(),
    findCompanyByCNPJ: jest.fn(),
    signup: jest.fn(),
    verifyPassword: jest.fn(),
    createServiceProvider: jest.fn(),
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
    let publicSearchService: ServiceService;

    beforeEach(() => {
        jest.clearAllMocks(); 
        publicSearchService = new ServiceService(mockServiceRepository, mockUserRepository);
    });

    describe('Validation and Exceptions', () => {
        
        it('should throw InvalidInputError for search terms less than 2 characters', async () => {
            const invalidTermFilters = { q: 'a' };

            await expect(publicSearchService.searchService(invalidTermFilters)).rejects.toThrow(InvalidInputError);
            
            await expect(publicSearchService.searchService(invalidTermFilters)).rejects.toThrow('O termo de busca deve ter pelo menos 2 caracteres.');
            
            expect(mockServiceRepository.filterServices).not.toHaveBeenCalled();
        });

        it('should NOT throw an error for empty search term (q is undefined)', async () => {
            const emptyFilters = {};
            
            mockServiceRepository.filterServices.mockResolvedValue([]); 

            await expect(publicSearchService.searchService(emptyFilters)).resolves.not.toThrow();
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
            await publicSearchService.searchService(inputFilters);

            expect(mockServiceRepository.filterServices).toHaveBeenCalledWith({
                searchTerm: 'Limpeza', 
            });
        });

        it('should pass all valid DTO filters to the repository when q is NOT present', async () => {
            const inputFilters: InputFilters = { minRating: 4.5, providerName: 'João' };
            await publicSearchService.searchService(inputFilters);
        });

        it('should prevent the specific "axis" filter from being passed when "q" is present (Conflict resolution)', async () => {
            const inputFilters = { q: 'Limpeza', axis: 'Serviços' };
            await publicSearchService.searchService(inputFilters);

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
            await publicSearchService.searchService(inputFilters);

            expect(mockServiceRepository.filterServices).toHaveBeenCalledWith({
                searchTerm: 'termo com espaços',
            });
        });
    });
});