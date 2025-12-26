import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock the database functions
vi.mock("./db", () => ({
  getDoeDesignsByUserId: vi.fn(),
  getDoeDesignById: vi.fn(),
  createDoeDesign: vi.fn(),
  updateDoeDesign: vi.fn(),
  deleteDoeDesign: vi.fn(),
  getActiveTemplates: vi.fn(),
  getTemplateById: vi.fn(),
  createTemplate: vi.fn(),
  updateTemplate: vi.fn(),
  deleteTemplate: vi.fn(),
}));

import {
  getDoeDesignsByUserId,
  getDoeDesignById,
  createDoeDesign,
  updateDoeDesign,
  deleteDoeDesign,
  getActiveTemplates,
  getTemplateById,
} from "./db";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(role: "user" | "admin" = "user"): TrpcContext {
  const user: AuthenticatedUser = {
    id: "test-user-123",
    email: "test@example.com",
    name: "Test User",
    avatarUrl: null,
    role,
    optimizationCredits: 10,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

describe("designs router", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("designs.list", () => {
    it("returns designs for the authenticated user", async () => {
      const mockDesigns = [
        {
          id: 1,
          userId: "test-user-123",
          name: "Test Design",
          mode: "2d_spot_projector",
          status: "draft",
          parameters: null,
          previewData: null,
          optimizationResult: null,
          phaseMapUrl: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      vi.mocked(getDoeDesignsByUserId).mockResolvedValue(mockDesigns);

      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.designs.list();

      expect(getDoeDesignsByUserId).toHaveBeenCalledWith("test-user-123");
      expect(result).toEqual(mockDesigns);
    });
  });

  describe("designs.create", () => {
    it("creates a new design for the authenticated user", async () => {
      vi.mocked(createDoeDesign).mockResolvedValue(123);

      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.designs.create({
        name: "New Design",
        mode: "2d_spot_projector",
      });

      expect(createDoeDesign).toHaveBeenCalledWith({
        userId: "test-user-123",
        name: "New Design",
        mode: "2d_spot_projector",
        status: "draft",
        parameters: null,
      });
      expect(result).toEqual({ id: 123 });
    });
  });

  describe("designs.get", () => {
    it("returns a specific design by ID", async () => {
      const mockDesign = {
        id: 1,
        userId: "test-user-123",
        name: "Test Design",
        mode: "2d_spot_projector",
        status: "draft" as const,
        parameters: null,
        previewData: null,
        optimizationResult: null,
        phaseMapUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(getDoeDesignById).mockResolvedValue(mockDesign);

      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.designs.get({ id: 1 });

      expect(getDoeDesignById).toHaveBeenCalledWith(1, "test-user-123");
      expect(result).toEqual(mockDesign);
    });
  });

  describe("designs.update", () => {
    it("updates an existing design", async () => {
      vi.mocked(updateDoeDesign).mockResolvedValue(true);

      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.designs.update({
        id: 1,
        name: "Updated Design",
        status: "optimized",
      });

      expect(updateDoeDesign).toHaveBeenCalledWith(1, "test-user-123", {
        name: "Updated Design",
        status: "optimized",
      });
      expect(result).toEqual({ success: true });
    });
  });

  describe("designs.delete", () => {
    it("deletes a design", async () => {
      vi.mocked(deleteDoeDesign).mockResolvedValue(true);

      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.designs.delete({ id: 1 });

      expect(deleteDoeDesign).toHaveBeenCalledWith(1, "test-user-123");
      expect(result).toEqual({ success: true });
    });
  });
});

describe("templates router", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("templates.list", () => {
    it("returns all active templates", async () => {
      const mockTemplates = [
        {
          id: 1,
          name: "50x50 Spot Array",
          description: "Standard 50x50 spot array template",
          mode: "2d_spot_projector",
          category: "spot_projector",
          parameters: { arrayRows: "50", arrayCols: "50" },
          thumbnailUrl: null,
          isActive: true,
          displayOrder: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      vi.mocked(getActiveTemplates).mockResolvedValue(mockTemplates);

      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.templates.list();

      expect(getActiveTemplates).toHaveBeenCalled();
      expect(result).toEqual(mockTemplates);
    });
  });

  describe("templates.get", () => {
    it("returns a specific template by ID", async () => {
      const mockTemplate = {
        id: 1,
        name: "50x50 Spot Array",
        description: "Standard template",
        mode: "2d_spot_projector",
        category: "spot_projector",
        parameters: { arrayRows: "50", arrayCols: "50" },
        thumbnailUrl: null,
        isActive: true,
        displayOrder: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(getTemplateById).mockResolvedValue(mockTemplate);

      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.templates.get({ id: 1 });

      expect(getTemplateById).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockTemplate);
    });
  });
});
