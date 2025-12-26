import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { getLucia } from "./_core/lucia";
import { z } from "zod";
import {
  createDoeDesign,
  getDoeDesignsByUserId,
  getDoeDesignById,
  updateDoeDesign,
  deleteDoeDesign,
  getActiveTemplates,
  getTemplateById,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  getUserCredits,
} from "./db";

// DOE Parameters schema
const doeParamsSchema = z.object({
  workingDistance: z.string(),
  workingDistanceUnit: z.string().optional(),
  wavelength: z.string(),
  mode: z.string(),
  deviceDiameter: z.string(),
  deviceShape: z.enum(["circular", "square"]),
  arrayRows: z.string().optional(),
  arrayCols: z.string().optional(),
  targetType: z.enum(["size", "angle"]).optional(),
  targetSize: z.string().optional(),
  targetAngle: z.string().optional(),
  tolerance: z.string().optional(),
  fabricationEnabled: z.boolean().optional(),
  fabricationRecipe: z.string().optional(),
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(async ({ ctx }) => {
      const sessionId = ctx.req.cookies?.doe_session;
      if (sessionId) {
        const lucia = await getLucia();
        await lucia.invalidateSession(sessionId);
        const blankCookie = lucia.createBlankSessionCookie();
        ctx.res.cookie(blankCookie.name, blankCookie.value, blankCookie.attributes);
      }
      return { success: true } as const;
    }),
  }),

  // User profile and credits
  user: router({
    // Get current user's credits
    credits: protectedProcedure.query(async ({ ctx }) => {
      return await getUserCredits(ctx.user.id);
    }),
  }),

  // DOE Designs CRUD
  designs: router({
    // List all designs for current user
    list: protectedProcedure.query(async ({ ctx }) => {
      return await getDoeDesignsByUserId(ctx.user.id);
    }),

    // Get single design by ID
    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        return await getDoeDesignById(input.id, ctx.user.id);
      }),

    // Create new design
    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1).max(255),
        mode: z.string(),
        parameters: doeParamsSchema.optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const id = await createDoeDesign({
          userId: ctx.user.id,
          name: input.name,
          mode: input.mode,
          status: "draft",
          parameters: input.parameters || null,
        });
        return { id };
      }),

    // Update design
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().min(1).max(255).optional(),
        mode: z.string().optional(),
        status: z.enum(["draft", "optimized"]).optional(),
        parameters: doeParamsSchema.optional(),
        previewData: z.any().optional(),
        optimizationResult: z.any().optional(),
        phaseMapUrl: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { id, ...updates } = input;
        const success = await updateDoeDesign(id, ctx.user.id, updates);
        return { success };
      }),

    // Delete design
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const success = await deleteDoeDesign(input.id, ctx.user.id);
        return { success };
      }),

    // Duplicate design from template
    createFromTemplate: protectedProcedure
      .input(z.object({
        templateId: z.number(),
        name: z.string().min(1).max(255).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const template = await getTemplateById(input.templateId);
        if (!template) {
          throw new Error("Template not found");
        }

        const id = await createDoeDesign({
          userId: ctx.user.id,
          name: input.name || `${template.name} Copy`,
          mode: template.mode,
          status: "draft",
          parameters: template.parameters,
        });
        return { id };
      }),
  }),

  // DOE Templates (public read, admin write)
  templates: router({
    // List all active templates
    list: publicProcedure.query(async () => {
      return await getActiveTemplates();
    }),

    // Get single template
    get: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await getTemplateById(input.id);
      }),

    // Create template (admin only)
    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1).max(255),
        description: z.string().optional(),
        mode: z.string(),
        category: z.string().optional(),
        parameters: doeParamsSchema,
        thumbnailUrl: z.string().optional(),
        displayOrder: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new Error("Only admins can create templates");
        }
        const id = await createTemplate({
          name: input.name,
          description: input.description || null,
          mode: input.mode,
          category: input.category || null,
          parameters: input.parameters,
          thumbnailUrl: input.thumbnailUrl || null,
          displayOrder: input.displayOrder || 0,
        });
        return { id };
      }),

    // Update template (admin only)
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().min(1).max(255).optional(),
        description: z.string().optional(),
        mode: z.string().optional(),
        category: z.string().optional(),
        parameters: doeParamsSchema.optional(),
        thumbnailUrl: z.string().optional(),
        isActive: z.boolean().optional(),
        displayOrder: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new Error("Only admins can update templates");
        }
        const { id, ...updates } = input;
        const success = await updateTemplate(id, updates);
        return { success };
      }),

    // Delete template (admin only)
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new Error("Only admins can delete templates");
        }
        const success = await deleteTemplate(input.id);
        return { success };
      }),
  }),

});

export type AppRouter = typeof appRouter;
