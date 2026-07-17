import { Router } from "express";
import { ContentController } from "../controllers/content.controller.js";
import { ContentRepository } from "../repositories/content.repository.js";
import { ContentService } from "../services/content.service.js";

const contentRepository = new ContentRepository();
const contentService = new ContentService(contentRepository);
const contentController = new ContentController(contentService);

export const contentRouter = Router();

contentRouter.get("/public", contentController.getPublicContent);
