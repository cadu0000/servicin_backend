import { ServiceRepository } from '../service.repository';
import MOCK_SERVICES from '../../data/service.mock'; 

describe('ServiceRepository', () => {
    let serviceRepository: ServiceRepository;
    
    const TOTAL_MOCK_SERVICES = MOCK_SERVICES.length;

    beforeAll(() => {
        serviceRepository = new ServiceRepository();
    });

    // TESTES DE BUSCA GENÉRICA (searchTerm)
    describe('General Search (searchTerm)', () => {

        //Cenário: Objeto de filtros vazio ou apenas com undefineds
        it('should return all services when no filters are applied', async () => {
            const filters = {}; 
            const results = await serviceRepository.filterServices(filters);

            expect(results.length).toBe(TOTAL_MOCK_SERVICES);
        });

        //Cenário: Testa busca por nome do serviço (Assume que o termo "Limpeza" está presente)
        it('should return services matching a term in the "name"', async () => {
            const filters = { searchTerm: 'Limpeza' };
            const results = await serviceRepository.filterServices(filters);

            expect(results.length).toBeLessThan(TOTAL_MOCK_SERVICES);
            expect(results.every(s => s.name.toLowerCase().includes('limpeza') || s.axis.toLowerCase().includes('limpeza'))).toBe(true);
        });

        //Cenário: Testa busca por eixo do serviço (Assume que o termo 'Pintura' está presente)
        it('should return services matching a term in the "axis"', async () => {
            const filters = { searchTerm: 'Pintura' };
            const results = await serviceRepository.filterServices(filters);
            
            expect(results.length).toBeGreaterThan(0);
            expect(results.every(s => s.axis.toLowerCase().includes('pintura'))).toBe(true);
        });

        //Cenário: Testa busca por um termo inexistente
        it('should return an empty array for an entirely non-existent search term', async () => {
            const filters = { searchTerm: 'ZZZZZTERMONAOEXISTENTE' };
            const results = await serviceRepository.filterServices(filters);

            expect(results.length).toBe(0);
            expect(results).toEqual([]);
        });
    });

    // TESTES DE FILTROS ESPECÍFICOS (minRating, maxPrice, etc.)
    describe('Specific DTO Filters', () => {
        
        //Cenário: Testa filtro por avaliação (Assume que nem todos os serviços têm avaliação de 5.0)
        it('should filter services by minimum rating (minRating)', async () => {
            const filters = { minRating: 5.0 }; 
            const results = await serviceRepository.filterServices(filters);

            expect(results.length).toBeLessThanOrEqual(TOTAL_MOCK_SERVICES);
            expect(results.every(s => s.averageRating >= 5.0)).toBe(true);
        });

        //Cenário: Testa filtro por nome do provedor (Assume que o termo 'Maria' é o nome de um provedor de serviços)
        it('should filter services by provider name (providerName)', async () => {
            const filters = { providerName: 'Maria' }; 
            const results = await serviceRepository.filterServices(filters);
            
            expect(results.length).toBeGreaterThan(0);
            expect(results.every(s => s.providerName.includes('Maria'))).toBe(true);
        });

        //Cenário: Testa filtro por valor mínimo. Assume 150
        it('should filter services by minPrice (minPrice)', async () => {
            const filters = { minPrice: 150 }; 
            const results = await serviceRepository.filterServices(filters);
            
            expect(results.length).toBeGreaterThan(0);
            expect(results.every(s => s.price >= 150)).toBe(true);
        });

        //Cenário: Testa filtro por valor máximo. Assume 500
        it('should filter services by maxPrice (maxPrice)', async () => {
            const filters = { maxPrice: 500 }; 
            const results = await serviceRepository.filterServices(filters);
            
            expect(results.length).toBeGreaterThan(0);
            expect(results.every(s => s.price <= 500)).toBe(true);
        });
        
        //Cenário: Testa filtro por tipo de cobrança. Assume 'Por projeto'
        it('should filter services by chargeType (chegeType)', async () => {
            const filters = { chargeType : 'Por Projeto' }; 
            const results = await serviceRepository.filterServices(filters);
            
            expect(results.length).toBeGreaterThan(0);
            expect(results.every(s => s.chargeType.toLowerCase() === 'por projeto')).toBe(true);
        });
    });

    // TESTES DE COMBINAÇÃO DE FILTROS
    describe('Combined Filters', () => {

        //Cenário: Assume uma combinação entre eixo de serviço com avaliação do serviço ('Limpeza' + 5)
        it('should correctly combine searchTerm and minRating', async () => {
            const filters = { searchTerm: 'Limpeza', minRating: 4.8 }; 
            const results = await serviceRepository.filterServices(filters);

            expect(results.length).toBeLessThan(TOTAL_MOCK_SERVICES);
            expect(results.every(s => s.name.toLowerCase().includes('limpeza') || s.axis.toLowerCase().includes('limpeza'))).toBe(true);
            expect(results.every(s => s.averageRating >= 4.8)).toBe(true);
        });

        //Cenário: Assume uma combinação entre eixo de serviço com preço (Busca sem retorno)
        it('should return an empty array if combined filters result in no matches', async () => {
            const filters = { searchTerm: 'Limpeza', maxPrice: 5 }; 
            const results = await serviceRepository.filterServices(filters);

            expect(results.length).toBe(0);
        });

        //Cenário: Assume uma combinação entre eixo de serviço e provedor
        it('should correctly combine searchTerm and providerName', async () => {
            const providerName = 'Maria';
            const filters = { searchTerm: 'Limpeza', providerName }; 
            const results = await serviceRepository.filterServices(filters);

            expect(results.length).toBeGreaterThanOrEqual(0); 
            expect(results.every(s => s.name.toLowerCase().includes('limpeza') || s.axis.toLowerCase().includes('limpeza'))).toBe(true);
            expect(results.every(s => s.providerName.toLowerCase().includes(providerName.toLowerCase()))).toBe(true);
        });

        //Cenário: Assume uma busca por eixo de serviço inexistente e avaliação (Busca sem retorno)
        it('should return an empty array if searchTerm is non-existent, regardless of other filters', async () => {
            const filters = { searchTerm: 'TermoInvalidoXYZ', minRating: 5.0 }; 
            const results = await serviceRepository.filterServices(filters);

            expect(results.length).toBe(0);
            expect(results).toEqual([]);
        });
    });
});