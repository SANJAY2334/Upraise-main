import type { NextFunction, Request, Response } from "express";
import { config } from "../config.js";
import type { AuthService } from "../services/auth.service.js";
import { BadRequestError } from "../shared/errors.js";

export class AuthController {
  constructor(private authService: AuthService) {}

  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password } = req.body;
      const ip = (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || req.ip || "";
      const userAgent = req.headers["user-agent"] || "";

      const data = await this.authService.login(email, password, ip, userAgent);

      const isProd = config.nodeEnv === "production";
      const isSecure = req.secure || req.headers?.["x-forwarded-proto"] === "https" || isProd;

      res.cookie("uprise_refresh_token", data.refreshToken, {
        httpOnly: true,
        secure: isSecure,
        sameSite: isSecure ? "none" : "lax",
        path: "/api/auth",
        maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
      });

      res.json({
        success: true,
        data: {
          accessToken: data.accessToken,
          user: data.user,
          requirePasswordChange: data.requirePasswordChange
        },
        requestId: req.id
      });
    } catch (error) {
      next(error);
    }
  };

  refresh = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const refreshToken = req.cookies?.uprise_refresh_token ?? req.body?.refreshToken;
      if (!refreshToken) {
        throw new BadRequestError("Refresh token is required.");
      }

      const data = await this.authService.refresh(refreshToken);

      res.json({
        success: true,
        data,
        requestId: req.id
      });
    } catch (error) {
      next(error);
    }
  };

  logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const refreshToken = req.cookies?.uprise_refresh_token ?? req.body?.refreshToken;

      const isProd = config.nodeEnv === "production";
      const isSecure = req.secure || req.headers?.["x-forwarded-proto"] === "https" || isProd;

      res.clearCookie("uprise_refresh_token", {
        httpOnly: true,
        secure: isSecure,
        sameSite: isSecure ? "none" : "lax",
        path: "/api/auth"
      });

      await this.authService.logout(refreshToken);

      res.json({
        success: true,
        data: { ok: true },
        requestId: req.id
      });
    } catch (error) {
      next(error);
    }
  };

  me = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      res.json({
        success: true,
        data: { user: req.user },
        requestId: req.id
      });
    } catch (error) {
      next(error);
    }
  };

  changePassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.user?.id;
      if (!userId) {
        throw new BadRequestError("User ID is missing.");
      }

      await this.authService.changePassword(userId, currentPassword, newPassword);

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
