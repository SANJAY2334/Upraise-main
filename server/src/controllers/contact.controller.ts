import type { NextFunction, Request, Response } from "express";
import type { ContactService } from "../services/contact.service.js";

export class ContactController {
  constructor(private contactService: ContactService) {}

  submitContact = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.contactService.submitContact(req.body);
      return res.status(201).json({
        success: true,
        data,
        requestId: req.id
      });
    } catch (error) {
      return next(error);
    }
  };
}
