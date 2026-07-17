import { Router } from "express";
import multer from "multer";
import { z } from "zod";
import { MediaController } from "../controllers/media.controller.js";
import { CloudinaryStorageProvider } from "../infrastructure/storage.provider.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { MediaRepository } from "../repositories/media.repository.js";
import { MediaService } from "../services/media.service.js";

/**
 * Lazy composition root.
 *
 * CloudinaryStorageProvider reads and validates Cloudinary config in its
 * constructor. We must NOT construct it at module-load time because the test
 * environment does not set Cloudinary env vars. The provider is instantiated
 * per-request (or once lazily) only when an actual upload request arrives.
 *
 * The repository and service are stateless and safe to construct eagerly.
 */
let controller: MediaController | null = null;

function getController(): MediaController {
  if (!controller) {
    const storageProvider = new CloudinaryStorageProvider();
    const mediaRepository = new MediaRepository();
    const mediaService = new MediaService(mediaRepository, storageProvider);
    controller = new MediaController(mediaService);
  }
  return controller;
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 } // 100 MB
});

const uploadBodySchema = z.object({
  alt: z.string().max(200).optional()
});

const deleteParamsSchema = z.object({
  id: z.string().min(1)
});

export const mediaRouter = Router();

mediaRouter.post(
  "/",
  requireAuth,
  requireRole(["ADMIN", "EDITOR"]),
  upload.single("asset"),
  validate({ body: uploadBodySchema }),
  (req, res, next) => getController().uploadAsset(req, res, next)
);

mediaRouter.delete(
  "/:id",
  requireAuth,
  requireRole(["ADMIN", "EDITOR"]),
  validate({ params: deleteParamsSchema }),
  (req, res, next) => getController().deleteAsset(req, res, next)
);
