import { ServiceService } from "../service.service";
import { ServiceRepository } from "../../repository/service.repository";
import { AuthRepository } from "../../repository/auth.repository";
import { FetchServicesQueryParamsDTO } from "../../schemas/service.schema";
import { prisma } from "../../lib/prisma";

jest.mock("../../lib/prisma", () => ({
  prisma: {
    address: {
      findUnique: jest.fn(),
    },
  },
}));

const mockServiceRepository: jest.Mocked<ServiceRepository> = {
  fetch: jest.fn(),
  fetchById: jest.fn(),
  create: jest.fn(),
  findCategoryById: jest.fn(),
};

const mockUserRepository: jest.Mocked<AuthRepository> = {
  findById: jest.fn(),
  findByEmail: jest.fn(),
  findIndividualByCPF: jest.fn(),
  findCompanyByCNPJ: jest.fn(),
  signup: jest.fn(),
  verifyPassword: jest.fn(),
  findUserWithDetails: jest.fn(),
  deleteAccount: jest.fn(),
  isServiceProvider: jest.fn(),
};

const MOCK_FETCH_RESULT = {
  data: [
    {
      id: "s1",
      name: "Serviço de Teste",
      description: "Teste",
      price: 100,
      rating: 4.5,
      photos: [],
      availabilities: [],
      appointments: [],
      provider: {
        userId: "provider-1",
        averageRating: 5.0,
        user: {
          photoUrl: null,
          individual: {
            fullName: "Provider Teste",
          },
          contacts: [],
        },
      },
      category: {
        id: 1,
        name: "Limpeza",
        description: "Teste",
      },
    },
  ],
  total: 1,
  page: 1,
  pageSize: 12,
  totalPages: 1,
} as any;

describe("ServiceService", () => {
  let serviceService: ServiceService;

  beforeEach(() => {
    jest.clearAllMocks();
    serviceService = new ServiceService(
      mockServiceRepository,
      mockUserRepository
    );
  });

  describe("fetch", () => {
    it("should call repository.fetch with correct parameters", async () => {
      const filters: FetchServicesQueryParamsDTO = {
        page: 1,
        pageSize: 12,
      };

      mockServiceRepository.fetch.mockResolvedValue(MOCK_FETCH_RESULT as any);

      const result = await serviceService.fetch(filters);

      expect(mockServiceRepository.fetch).toHaveBeenCalledWith(filters);
      const expectedResult = {
        ...MOCK_FETCH_RESULT,
        data: MOCK_FETCH_RESULT.data.map((service: any) => {
          const { appointments, ...serviceWithoutAppointments } = service;
          return {
            ...serviceWithoutAppointments,
            rating: service.rating ? Number(service.rating) : 0,
            provider: {
              ...service.provider,
              averageRating: service.provider.averageRating
                ? Number(service.provider.averageRating)
                : 0,
            },
            unavailableTimeSlots: [],
          };
        }),
      };
      expect(result).toEqual(expectedResult);
    });

    it("should pass search term (q) to repository", async () => {
      const filters: FetchServicesQueryParamsDTO = {
        q: "Limpeza",
        page: 1,
        pageSize: 12,
      };

      mockServiceRepository.fetch.mockResolvedValue(MOCK_FETCH_RESULT as any);

      await serviceService.fetch(filters);

      expect(mockServiceRepository.fetch).toHaveBeenCalledWith(
        expect.objectContaining({
          q: "Limpeza",
        })
      );
    });

    it("should pass all filter parameters to repository", async () => {
      const filters: FetchServicesQueryParamsDTO = {
        q: "Limpeza",
        category: "Limpeza",
        minPrice: 50,
        maxPrice: 500,
        minRating: 4.0,
        providerName: "João",
        page: 1,
        pageSize: 12,
      };

      mockServiceRepository.fetch.mockResolvedValue(MOCK_FETCH_RESULT as any);

      await serviceService.fetch(filters);

      expect(mockServiceRepository.fetch).toHaveBeenCalledWith(filters);
    });

    it("should throw error when repository returns null", async () => {
      const filters: FetchServicesQueryParamsDTO = {
        page: 1,
        pageSize: 12,
      };

      mockServiceRepository.fetch.mockResolvedValue(null as any);

      await expect(serviceService.fetch(filters)).rejects.toThrow(
        "No services found"
      );
    });

    it("should return paginated results with correct structure", async () => {
      const filters: FetchServicesQueryParamsDTO = {
        page: 1,
        pageSize: 12,
      };

      mockServiceRepository.fetch.mockResolvedValue(MOCK_FETCH_RESULT as any);

      const result = await serviceService.fetch(filters);

      expect(result).toHaveProperty("data");
      expect(result).toHaveProperty("total");
      expect(result).toHaveProperty("page");
      expect(result).toHaveProperty("pageSize");
      expect(result).toHaveProperty("totalPages");
      expect(Array.isArray(result.data)).toBe(true);
    });
  });

  describe("fetchById", () => {
    it("should call repository.fetchById with correct id", async () => {
      const serviceId = "service-123";
      const mockService = MOCK_FETCH_RESULT.data[0];

      mockServiceRepository.fetchById.mockResolvedValue(mockService as any);

      const result = await serviceService.fetchById(serviceId);

      expect(mockServiceRepository.fetchById).toHaveBeenCalledWith(serviceId);
      const { appointments, ...serviceWithoutAppointments } =
        mockService as any;
      const expectedResult = {
        ...serviceWithoutAppointments,
        rating: (mockService as any).rating
          ? Number((mockService as any).rating)
          : 0,
        provider: {
          ...(mockService as any).provider,
          averageRating: (mockService as any).provider.averageRating
            ? Number((mockService as any).provider.averageRating)
            : 0,
        },
        unavailableTimeSlots: [],
      };
      expect(result).toEqual(expectedResult);
    });

    it("should throw error when service is not found", async () => {
      const serviceId = "non-existent-id";

      mockServiceRepository.fetchById.mockResolvedValue(null);

      await expect(serviceService.fetchById(serviceId)).rejects.toThrow(
        "No service found"
      );
    });
  });

  describe("create", () => {
    it("should create service when all validations pass", async () => {
      const createData = {
        providerId: "provider-1",
        categoryId: 1,
        addressId: "address-1",
        name: "Novo Serviço",
        description: "Descrição",
        price: 100,
        availability: [],
      };

      const mockUser = { id: "provider-1" };
      const mockCategory = { id: 1, name: "Limpeza" };
      const mockAddress = { id: "address-1" };
      const mockCreatedService = { id: "new-service-id" };

      mockUserRepository.findById.mockResolvedValue(mockUser as any);
      mockServiceRepository.findCategoryById.mockResolvedValue(
        mockCategory as any
      );
      (prisma.address.findUnique as jest.Mock).mockResolvedValue(mockAddress);
      mockServiceRepository.create.mockResolvedValue(mockCreatedService as any);

      const result = await serviceService.create(createData);

      expect(mockUserRepository.findById).toHaveBeenCalledWith("provider-1");
      expect(mockServiceRepository.findCategoryById).toHaveBeenCalledWith(1);
      expect(mockServiceRepository.create).toHaveBeenCalledWith(createData);
      expect(result).toEqual(mockCreatedService);
    });

    it("should throw error when user does not exist", async () => {
      const createData = {
        providerId: "non-existent",
        categoryId: 1,
        addressId: "address-1",
        name: "Novo Serviço",
        description: "Descrição",
        price: 100,
        availability: [],
      };

      mockUserRepository.findById.mockResolvedValue(null);

      await expect(serviceService.create(createData)).rejects.toThrow(
        "User does not exist"
      );
    });

    it("should throw error when category does not exist", async () => {
      const createData = {
        providerId: "provider-1",
        categoryId: 999,
        addressId: "address-1",
        name: "Novo Serviço",
        description: "Descrição",
        price: 100,
        availability: [],
      };

      const mockUser = { id: "provider-1" };

      mockUserRepository.findById.mockResolvedValue(mockUser as any);
      mockServiceRepository.findCategoryById.mockResolvedValue(null);

      await expect(serviceService.create(createData)).rejects.toThrow(
        "Category does not exist"
      );
    });

    it("should throw error when address does not exist", async () => {
      const createData = {
        providerId: "provider-1",
        categoryId: 1,
        addressId: "non-existent-address",
        name: "Novo Serviço",
        description: "Descrição",
        price: 100,
        availability: [],
      };

      const mockUser = { id: "provider-1" };
      const mockCategory = { id: 1, name: "Limpeza" };

      mockUserRepository.findById.mockResolvedValue(mockUser as any);
      mockServiceRepository.findCategoryById.mockResolvedValue(
        mockCategory as any
      );
      (prisma.address.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(serviceService.create(createData)).rejects.toThrow(
        "Address does not exist"
      );
    });
  });
});
