import { Request, Response } from "express";
import { AuthService, RegisterData, LoginData, TokenData } from "../services/auth.service";
import { catchAsync } from "../middleware/error.middleware";

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  register = catchAsync(async (req: Request, res: Response) => {
    const registerData: RegisterData = req.body;
    
    const result = await this.authService.register(registerData);
    
    res.status(201).json({
      status: "success",
      message: "User registered successfully",
      data: result,
    });
  });

  login = catchAsync(async (req: Request, res: Response) => {
    const loginData: LoginData = req.body;
    
    const result = await this.authService.login(loginData);
    
    res.status(200).json({
      status: "success",
      message: "Login successful",
      data: result,
    });
  });

  refreshToken = catchAsync(async (req: Request, res: Response) => {
    const tokenData: TokenData = req.body;
    
    const result = await this.authService.refreshToken(tokenData);
    
    res.status(200).json({
      status: "success",
      message: "Token refreshed successfully",
      data: result,
    });
  });
}
