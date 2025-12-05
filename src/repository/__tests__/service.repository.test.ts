import { ServiceRepository } from "../service.repository";

describe("ServiceRepository", () => {
  let serviceRepository: ServiceRepository;

  beforeAll(() => {
    serviceRepository = new ServiceRepository();
  });

  describe("General Search (q parameter)", () => {
    it("should return paginated services when no filters are applied", async () => {
      const filters = { page: 1, pageSize: 12 };
      const results = await serviceRepository.fetch(filters);

      expect(results).toHaveProperty("data");
      expect(results).toHaveProperty("total");
      expect(results).toHaveProperty("page");
      expect(results).toHaveProperty("pageSize");
      expect(results).toHaveProperty("totalPages");
      expect(Array.isArray(results.data)).toBe(true);
    });

    it("should return services matching a term in the service name", async () => {
      const filters = { q: "Limpeza", page: 1, pageSize: 12 };
      const results = await serviceRepository.fetch(filters);

      expect(results.data.length).toBeGreaterThanOrEqual(0);
      if (results.data.length > 0) {
        expect(
          results.data.some(
            (s) =>
              s.name.toLowerCase().includes("limpeza") ||
              s.category?.name.toLowerCase().includes("limpeza")
          )
        ).toBe(true);
      }
    });

    it("should return services matching a term in the category name", async () => {
      const filters = { q: "Pintura", page: 1, pageSize: 12 };
      const results = await serviceRepository.fetch(filters);

      expect(results.data.length).toBeGreaterThanOrEqual(0);
      if (results.data.length > 0) {
        expect(
          results.data.some(
            (s) =>
              s.name.toLowerCase().includes("pintura") ||
              s.category?.name.toLowerCase().includes("pintura")
          )
        ).toBe(true);
      }
    });

    it("should return an empty array for an entirely non-existent search term", async () => {
      const filters = { q: "ZZZZZTERMONAOEXISTENTE", page: 1, pageSize: 12 };
      const results = await serviceRepository.fetch(filters);

      expect(results.data.length).toBe(0);
      expect(results.data).toEqual([]);
    });
  });

  describe("Specific DTO Filters", () => {
    it("should filter services by minimum rating (minRating)", async () => {
      const filters = { minRating: 4.0, page: 1, pageSize: 12 };
      const results = await serviceRepository.fetch(filters);

      expect(results.data.length).toBeGreaterThanOrEqual(0);
      if (results.data.length > 0) {
        expect(
          results.data.every((s) => {
            const rating = parseFloat(s.provider.averageRating.toString());
            return rating >= 4.0;
          })
        ).toBe(true);
      }
    });

    it("should filter services by provider name (providerName)", async () => {
      const filters = { providerName: "Maria", page: 1, pageSize: 12 };
      const results = await serviceRepository.fetch(filters);

      expect(results.data.length).toBeGreaterThanOrEqual(0);
      if (results.data.length > 0) {
        expect(
          results.data.every((s) => {
            const fullName = s.provider.user.individual?.fullName || "";
            return fullName.toLowerCase().includes("maria");
          })
        ).toBe(true);
      }
    });

    it("should filter services by minPrice", async () => {
      const filters = { minPrice: 50, page: 1, pageSize: 12 };
      const results = await serviceRepository.fetch(filters);

      expect(results.data.length).toBeGreaterThanOrEqual(0);
      if (results.data.length > 0) {
        expect(
          results.data.every((s) => {
            const price = parseFloat(s.price.toString());
            return price >= 50;
          })
        ).toBe(true);
      }
    });

    it("should filter services by maxPrice", async () => {
      const filters = { maxPrice: 500, page: 1, pageSize: 12 };
      const results = await serviceRepository.fetch(filters);

      expect(results.data.length).toBeGreaterThanOrEqual(0);
      if (results.data.length > 0) {
        expect(
          results.data.every((s) => {
            const price = parseFloat(s.price.toString());
            return price <= 500;
          })
        ).toBe(true);
      }
    });

    it("should filter services by category", async () => {
      const filters = { category: "Limpeza", page: 1, pageSize: 12 };
      const results = await serviceRepository.fetch(filters);

      expect(results.data.length).toBeGreaterThanOrEqual(0);
      if (results.data.length > 0) {
        expect(
          results.data.every(
            (s) => s.category?.name.toLowerCase() === "limpeza"
          )
        ).toBe(true);
      }
    });
  });

  describe("Combined Filters", () => {
    it("should correctly combine search term (q) and minRating", async () => {
      const filters = { q: "Limpeza", minRating: 4.0, page: 1, pageSize: 12 };
      const results = await serviceRepository.fetch(filters);

      expect(results.data.length).toBeGreaterThanOrEqual(0);
      if (results.data.length > 0) {
        expect(
          results.data.every((s) => {
            const matchesSearch =
              s.name.toLowerCase().includes("limpeza") ||
              s.category?.name.toLowerCase().includes("limpeza");
            const rating = parseFloat(s.provider.averageRating.toString());
            return matchesSearch && rating >= 4.0;
          })
        ).toBe(true);
      }
    });

    it("should return an empty array if combined filters result in no matches", async () => {
      const filters = { q: "Limpeza", maxPrice: 5, page: 1, pageSize: 12 };
      const results = await serviceRepository.fetch(filters);

      expect(results.data.length).toBe(0);
    });

    it("should correctly combine search term (q) and providerName", async () => {
      const providerName = "Maria";
      const filters = { q: "Limpeza", providerName, page: 1, pageSize: 12 };
      const results = await serviceRepository.fetch(filters);

      expect(results.data.length).toBeGreaterThanOrEqual(0);
      if (results.data.length > 0) {
        expect(
          results.data.every((s) => {
            const matchesSearch =
              s.name.toLowerCase().includes("limpeza") ||
              s.category?.name.toLowerCase().includes("limpeza");
            const fullName = s.provider.user.individual?.fullName || "";
            return (
              matchesSearch &&
              fullName.toLowerCase().includes(providerName.toLowerCase())
            );
          })
        ).toBe(true);
      }
    });

    it("should return an empty array if search term is non-existent, regardless of other filters", async () => {
      const filters = {
        q: "TermoInvalidoXYZ",
        minRating: 5.0,
        page: 1,
        pageSize: 12,
      };
      const results = await serviceRepository.fetch(filters);

      expect(results.data.length).toBe(0);
      expect(results.data).toEqual([]);
    });

    it("should correctly combine category and minPrice filters", async () => {
      const filters = {
        category: "Limpeza",
        minPrice: 50,
        page: 1,
        pageSize: 12,
      };
      const results = await serviceRepository.fetch(filters);

      expect(results.data.length).toBeGreaterThanOrEqual(0);
      if (results.data.length > 0) {
        expect(
          results.data.every((s) => {
            const matchesCategory =
              s.category?.name.toLowerCase() === "limpeza";
            const price = parseFloat(s.price.toString());
            return matchesCategory && price >= 50;
          })
        ).toBe(true);
      }
    });
  });
});
