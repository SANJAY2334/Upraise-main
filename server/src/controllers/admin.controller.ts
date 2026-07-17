import type { NextFunction, Request, Response } from "express";
import type { AdminService } from "../services/admin.service.js";

export class AdminController {
  constructor(private adminService: AdminService) {}

  getDashboard = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.adminService.getDashboardData();
      res.json({
        success: true,
        data,
        requestId: req.id
      });
    } catch (error) {
      next(error);
    }
  };

  getLeads = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = req.query.page ? Number(req.query.page) : 1;
      const status = req.query.status ? String(req.query.status) : undefined;

      const data = await this.adminService.getLeads({ status, page });
      res.json({
        success: true,
        data,
        requestId: req.id
      });
    } catch (error) {
      next(error);
    }
  };

  updateLeadStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const leadId = String(req.params.id);
      const status = req.body.status;
      const userId = req.user?.id;

      const data = await this.adminService.updateLeadStatus({ id: leadId, status, userId });
      res.json({
        success: true,
        data,
        requestId: req.id
      });
    } catch (error) {
      next(error);
    }
  };

  getContactMessages = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = req.query.page ? Number(req.query.page) : 1;
      const search = req.query.search ? String(req.query.search) : undefined;

      const data = await this.adminService.getContactMessages({ search, page });
      res.json({
        success: true,
        data,
        requestId: req.id
      });
    } catch (error) {
      next(error);
    }
  };

  deleteContactMessage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = String(req.params.id);
      const userId = req.user?.id;

      await this.adminService.deleteContactMessage({ id, userId });
      res.json({
        success: true,
        data: { ok: true },
        requestId: req.id
      });
    } catch (error) {
      next(error);
    }
  };

  getServices = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = req.query.page ? Number(req.query.page) : 1;
      const search = req.query.search ? String(req.query.search) : undefined;

      const data = await this.adminService.getServices({ search, page });
      res.json({
        success: true,
        data,
        requestId: req.id
      });
    } catch (error) {
      next(error);
    }
  };

  createService = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.adminService.createService({
        data: req.body,
        userId: req.user?.id
      });
      res.status(201).json({
        success: true,
        data,
        requestId: req.id
      });
    } catch (error) {
      next(error);
    }
  };

  updateService = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = String(req.params.id);
      const data = await this.adminService.updateService({
        id,
        data: req.body,
        userId: req.user?.id
      });
      res.json({
        success: true,
        data,
        requestId: req.id
      });
    } catch (error) {
      next(error);
    }
  };

  deleteService = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = String(req.params.id);
      const userId = req.user?.id;

      await this.adminService.deleteService({ id, userId });
      res.json({
        success: true,
        data: { ok: true },
        requestId: req.id
      });
    } catch (error) {
      next(error);
    }
  };

  getProjects = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = req.query.page ? Number(req.query.page) : 1;
      const search = req.query.search ? String(req.query.search) : undefined;

      const data = await this.adminService.getProjects({ search, page });
      res.json({
        success: true,
        data,
        requestId: req.id
      });
    } catch (error) {
      next(error);
    }
  };

  createProject = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.adminService.createProject({
        data: req.body,
        userId: req.user?.id
      });
      res.status(201).json({
        success: true,
        data,
        requestId: req.id
      });
    } catch (error) {
      next(error);
    }
  };

  updateProject = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = String(req.params.id);
      const data = await this.adminService.updateProject({
        id,
        data: req.body,
        userId: req.user?.id
      });
      res.json({
        success: true,
        data,
        requestId: req.id
      });
    } catch (error) {
      next(error);
    }
  };

  deleteProject = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = String(req.params.id);
      const userId = req.user?.id;

      await this.adminService.deleteProject({ id, userId });
      res.json({
        success: true,
        data: { ok: true },
        requestId: req.id
      });
    } catch (error) {
      next(error);
    }
  };

  getMediaAssets = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = req.query.page ? Number(req.query.page) : 1;
      const data = await this.adminService.getMediaAssets({ page });
      res.json({
        success: true,
        data,
        requestId: req.id
      });
    } catch (error) {
      next(error);
    }
  };

  deleteMediaAsset = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = String(req.params.id);
      const userId = req.user?.id;

      await this.adminService.deleteMediaAsset({ id, userId });
      res.json({
        success: true,
        data: { ok: true },
        requestId: req.id
      });
    } catch (error) {
      next(error);
    }
  };
}
