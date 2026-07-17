import { config } from "../config.js";
import { BadRequestError } from "../shared/errors.js";
export class AuthController {
    authService;
    constructor(authService) {
        this.authService = authService;
    }
    login = async (req, res, next) => {
        try {
            const { email, password } = req.body;
            const data = await this.authService.login(email, password);
            res.cookie("uprise_refresh_token", data.refreshToken, {
                httpOnly: true,
                secure: config.nodeEnv === "production",
                sameSite: "lax",
                path: "/api/auth",
                maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
            });
            res.json({
                success: true,
                data,
                requestId: req.id
            });
        }
        catch (error) {
            next(error);
        }
    };
    refresh = async (req, res, next) => {
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
        }
        catch (error) {
            next(error);
        }
    };
    logout = async (req, res, next) => {
        try {
            const refreshToken = req.cookies?.uprise_refresh_token ?? req.body?.refreshToken;
            res.clearCookie("uprise_refresh_token", {
                httpOnly: true,
                secure: config.nodeEnv === "production",
                sameSite: "lax",
                path: "/api/auth"
            });
            await this.authService.logout(refreshToken);
            res.json({
                success: true,
                data: { ok: true },
                requestId: req.id
            });
        }
        catch (error) {
            next(error);
        }
    };
    me = async (req, res, next) => {
        try {
            res.json({
                success: true,
                data: { user: req.user },
                requestId: req.id
            });
        }
        catch (error) {
            next(error);
        }
    };
}
