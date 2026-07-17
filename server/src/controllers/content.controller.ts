import type { NextFunction, Request, Response } from "express";
import type { ContentService } from "../services/content.service.js";

export class ContentController {
  constructor(private contentService: ContentService) {}

  getPublicContent = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.contentService.getPublicContent();
      return res.json({
        success: true,
        data,
        requestId: req.id
      });
    } catch (error) {
      return next(error);
    }
  };
}
