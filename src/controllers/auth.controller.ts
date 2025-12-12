import { UserService } from "./../service/user.service";
import { Request, Response } from "express";
import {
  adminRepository,
  userRepository,
} from "../repositories/user.repository";
import { AuthService, IAuthService } from "../service/auth.service";
import { ApiResponse, LoginPayload } from "../types/auth.type";
import { User } from "../model/user";
import { Admin } from "../model/admin";
import { AppError } from "../error-codes/app.error";

export interface IAuthController {
  login: (
    req: Request,
    res: Response
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

  adminRegister: (
    req: Request,
    res: Response<ApiResponse<Admin>>
  ) => Promise<Response<ApiResponse<Admin>>>;

  adminLogin: (
    req: Request,
    res: Response<
      ApiResponse<{
        token: string;
        admin: Admin;
      }>
    >
  ) => Promise<
    Response<
      ApiResponse<{
        token: string;
        admin: Admin;
      }>
    >
  >;

  adminValidate: (
    req: Request,
    res: Response<ApiResponse<Admin>>
  ) => Promise<Response<ApiResponse<Admin>>>;
}

export class AuthController implements IAuthController {
  private authService: IAuthService;

  constructor() {
    this.authService = new AuthService(
      new UserService(userRepository),
      adminRepository
    );
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

  register = async (req: Request, res: Response) => {
    const userService = new UserService(userRepository);

    const userExist = await userService.userFindByEmail(req.body.email);
    if (userExist)
      return res.status(400).json({ message: `user already exist` });

    const newUser = await userService.createUser(req.body);
    return res.status(201).json({
      message: `user create success`,
      user: newUser,
    });
  };

  changePassword = async (req: Request, res: Response) => {
    try {
      const { email, oldPassword, newPassword } = req.body;

      if (!email || !oldPassword || !newPassword) {
        return res
          .status(400)
          .json({ message: "email, oldPassword and newPassword are required" });
      }

      const userService = new UserService(userRepository);

      const userExist = await userService.userFindByEmail(req.body.email);
      if (!userExist)
        return res.status(400).json({ message: `user not found!` });

      const equalpassword = await userService.comparePassword(
        oldPassword,
        userExist.password
      );
      if (!equalpassword) {
        return res.status(400).json({ message: "Old password is incorrect" });
      }

      await userService.changePassword({ email, newPassword, oldPassword });

      return res.status(200).json({
        message: "Password updated successfully",
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  };

  adminRegister = async (req: Request, res: Response<ApiResponse<Admin>>) => {
    const adminExist = await this.authService.findAdminByEmail(req.body.email);
    console.log(req.body);
    if (adminExist) {
      throw new AppError(
        "email already exist!",
        "ADMIN_REGISTER_DUPLICATE",
        400
      );
    }

    const admin = await this.authService.adminRegister(req.body);
    return res.status(201).json({
      message: "admin register",
      data: admin,
      success: true,
    });
  };

  adminLogin = async (
    req: Request,
    res: Response<
      ApiResponse<{
        token: string;
        admin: Admin;
      }>
    >
  ) => {
    const payload: LoginPayload = req.body;
    const loginData = await this.authService.adminLogin(payload);

    return res.status(200).json({
      data: {
        admin: loginData.admin,
        token: loginData.token,
      },
      message: "login success",
      success: true,
    });
  };

  adminValidate = async (req: Request, res: Response<ApiResponse<Admin>>) => {
    const user = await this.authService.findAdminByEmail(req.user?.email!);
    if (!user) {
      throw new AppError("user not found", "AUTH_INVALID_USER", 401);
    }

    return res.status(200).json({
      data: user,
      message: "validate success",
      success: true,
    });
  };
}
