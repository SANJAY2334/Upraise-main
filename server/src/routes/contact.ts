import { Router } from "express";
import rateLimit from "express-rate-limit";
import { z } from "zod";
import { ContactController } from "../controllers/contact.controller.js";
import { validateBody } from "../middleware/validate.js";
import { ContactRepository } from "../repositories/contact.repository.js";
import { ContactService } from "../services/contact.service.js";

const contactSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email().max(180),
  phone: z.string().max(40).optional().default(""),
  company: z.string().max(140).optional().default(""),
  interest: z.string().min(2).max(120),
  message: z.string().min(10).max(3000),
  consent: z.literal(true)
});

const contactRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 5, // Limit each IP to 5 contact requests per windowMs
  message: {
    message: "Too many contact submissions from this IP. Please try again after 15 minutes."
  },
  standardHeaders: true,
  legacyHeaders: false
});

const contactRepository = new ContactRepository();
const contactService = new ContactService(contactRepository);
const contactController = new ContactController(contactService);

export const contactRouter = Router();

contactRouter.post("/", contactRateLimiter, validateBody(contactSchema), contactController.submitContact);
