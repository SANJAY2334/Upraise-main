import { Router } from "express";
import { createCsrfToken } from "../middleware/csrf.js";
export const csrfRouter = Router();
csrfRouter.get("/", createCsrfToken);
