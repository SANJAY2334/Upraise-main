import type { NextFunction, Request, Response } from "express";
import type { MediaService } from "../services/media.service.js";
import { BadRequestError } from "../shared/errors.js";

export class MediaController {
  constructor(private mediaService: MediaService) {}

  uploadAsset = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.file) {
        throw new BadRequestError("Asset file is required.");
      }

      const alt = typeof req.body.alt === "string" ? req.body.alt : undefined;
      const data = await this.mediaService.uploadAsset({
        buffer: req.file.buffer,
        originalName: req.file.originalname,
        alt
      });

      res.status(201).json({ success: true, data, requestId: req.id });
    } catch (error) {
      next(error);
    }
  };

  deleteAsset = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params.id as string;
      await this.mediaService.deleteAsset(id);
      res.status(200).json({ success: true, data: null, requestId: req.id });
    } catch (error) {
      next(error);
    }
  };
}
