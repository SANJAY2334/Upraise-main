import { Router } from "express";
import { z } from "zod";
import { AuthController } from "../controllers/auth.controller.js";
import { requireAuth } from "../middleware/auth.js";
import { validateBody } from "../middleware/validate.js";
import { AuthRepository } from "../repositories/auth.repository.js";
import { AuthService } from "../services/auth.service.js";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

const authRepository = new AuthRepository();
const authService = new AuthService(authRepository);
const authController = new AuthController(authService);

export const authRouter = Router();

authRouter.post("/login", validateBody(loginSchema), authController.login);
authRouter.post("/refresh", authController.refresh);
authRouter.post("/logout", authController.logout);
authRouter.get("/me", requireAuth, authController.me);
