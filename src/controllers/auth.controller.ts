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

  register = async (req: Request, res: Response) => {
  const userService = new UserService(userRepository);

  const userExist = await userService.userFindByEmail(req.body.email);
  if (userExist) return res.status(400).json({ message: `user already exist` });

  const newUser = await userService.createUser(req.body);
  return res.status(201).json({
    message: `user create success`,
    user: newUser
  });
};
}
