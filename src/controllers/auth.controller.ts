import { Request, Response } from "express";
import { userRepository } from "../repositories/user.repository";
import { AuthService, IAuthService } from "../service/auth.service";
import { UserService } from "../service/user.service";
import { ApiResponse, LoginPayload } from "../types/auth.type";
import { User } from "../model/user";

export interface IAuthController {
  login: (
    req: Request,
    res: Response<ApiResponse<string>>
  ) => Promise<
    Response<
      ApiResponse<{
        token: string;
        user: User;
      }>
    >
  >;
}

export class AuthController implements IAuthController {
  private authService: IAuthService;

  constructor() {
    this.authService = new AuthService(new UserService(userRepository));
  }
  login = async (req: Request, res: Response) => {
    const payload: LoginPayload = req.body;
    const loginData = await this.authService.login(payload);

    return res.status(200).json({
      data: {
        user: loginData.user,
        token: loginData.token,
      },
      message: "login success",
      success: true,
    });
  };
}
