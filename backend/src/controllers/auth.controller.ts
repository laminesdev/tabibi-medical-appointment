import { Request, Response } from "express";
import { AuthService, RegisterData, LoginData, TokenData } from "../services/auth.service";
import { catchAsync } from "../middleware/error.middleware";
import { ResponseUtils } from "../utils/response.utils";

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  register = catchAsync(async (req: Request, res: Response) => {
    const registerData: RegisterData = req.body;

    const result = await this.authService.register(registerData);

    ResponseUtils.success(res, result, "User registered successfully", 201);
  });

  login = catchAsync(async (req: Request, res: Response) => {
    const loginData: LoginData = req.body;

    const result = await this.authService.login(loginData);

    ResponseUtils.success(res, result, "Login successful");
  });

  refreshToken = catchAsync(async (req: Request, res: Response) => {
    const tokenData: TokenData = req.body;

    const result = await this.authService.refreshToken(tokenData);

    ResponseUtils.success(res, result, "Token refreshed successfully");
  });
}
