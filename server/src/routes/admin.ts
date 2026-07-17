import { Router } from "express";
import { z } from "zod";
import { AdminController } from "../controllers/admin.controller.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { AdminRepository } from "../repositories/admin.repository.js";
import { AdminService } from "../services/admin.service.js";

const statusSchema = z.object({
  status: z.enum(["NEW", "CONTACTED", "DISCUSSION", "PROPOSAL_SENT", "CONVERTED", "CLOSED"])
});

const serviceSchema = z.object({
  title: z.string().min(2).max(120),
  slug: z.string().min(2).max(120),
  description: z.string().min(2).max(2000),
  deliverables: z.array(z.string()).default([]),
  benefits: z.array(z.string()).default([]),
  successStories: z.array(z.string()).default([]),
  isPublished: z.boolean().default(false),
  sortOrder: z.number().int().default(0)
});

const projectSchema = z.object({
  title: z.string().min(2).max(200),
  slug: z.string().min(2).max(200),
  category: z.string().min(2).max(100),
  clientName: z.string().min(2).max(200),
  story: z.string().min(2).max(5000),
  results: z.array(z.string()).default([]),
  isFeatured: z.boolean().default(false),
  isPublished: z.boolean().default(false)
});

const idParamSchema = z.object({
  id: z.string().min(1, "ID is required.")
});

const listQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? Math.max(1, parseInt(val, 10)) : 1)),
  search: z.string().optional()
});

const leadsQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? Math.max(1, parseInt(val, 10)) : 1)),
  status: z.enum(["NEW", "CONTACTED", "DISCUSSION", "PROPOSAL_SENT", "CONVERTED", "CLOSED"]).optional()
});

const mediaQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? Math.max(1, parseInt(val, 10)) : 1))
});

const adminRepository = new AdminRepository();
const adminService = new AdminService(adminRepository);
const adminController = new AdminController(adminService);

export const adminRouter = Router();

// Apply auth and role protection to all routes below
adminRouter.use(requireAuth, requireRole(["ADMIN", "EDITOR"]));

// Dashboard
adminRouter.get("/dashboard", adminController.getDashboard);

// Leads
adminRouter.get("/leads", validate({ query: leadsQuerySchema }), adminController.getLeads);
adminRouter.patch(
  "/leads/:id/status",
  validate({ params: idParamSchema, body: statusSchema }),
  adminController.updateLeadStatus
);

// Contact Messages
adminRouter.get("/messages", validate({ query: listQuerySchema }), adminController.getContactMessages);
adminRouter.delete("/messages/:id", validate({ params: idParamSchema }), adminController.deleteContactMessage);

// Services
adminRouter.get("/services", validate({ query: listQuerySchema }), adminController.getServices);
adminRouter.post("/services", validate({ body: serviceSchema }), adminController.createService);
adminRouter.patch(
  "/services/:id",
  validate({ params: idParamSchema, body: serviceSchema.partial() }),
  adminController.updateService
);
adminRouter.delete("/services/:id", validate({ params: idParamSchema }), adminController.deleteService);

// Projects
adminRouter.get("/projects", validate({ query: listQuerySchema }), adminController.getProjects);
adminRouter.post("/projects", validate({ body: projectSchema }), adminController.createProject);
adminRouter.patch(
  "/projects/:id",
  validate({ params: idParamSchema, body: projectSchema.partial() }),
  adminController.updateProject
);
adminRouter.delete("/projects/:id", validate({ params: idParamSchema }), adminController.deleteProject);

// Media
adminRouter.get("/media", validate({ query: mediaQuerySchema }), adminController.getMediaAssets);
adminRouter.delete("/media/:id", validate({ params: idParamSchema }), adminController.deleteMediaAsset);
