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
  profile: (
    req: Request,
    res: Response
  ) => Promise<
    Response<
      ApiResponse<{
        message: string;
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

  profile = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const userService = new UserService(userRepository);
    const user = await userService.userFindById(userId!);
    if (!user) return res.status(404).json({ Messsage: "user not found" });
    return res.status(200).json({
      message: "fetch success",
      user: {
        userId: user.id,
        username: user.username,
        email: user.email,
        password: user.password,
      },
    });
  };
}
