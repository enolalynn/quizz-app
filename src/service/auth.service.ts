import {
  ADMIN_TOKEN_SECRET,
  USER_TOKEN_SECRET,
} from "../constants/auth.constants";
import { AppError } from "../error-codes/app.error";
import { Admin } from "../model/admin";
import { User } from "../model/user";
import {
  AdminRegisterPayload,
  LoginPayload,
  TokenPayload,
} from "../types/auth.type";
import { IUserService } from "./user.service";
import jwt from "jsonwebtoken";
import { Repository } from "typeorm";

export interface IAuthService {
  login: (payload: LoginPayload) => Promise<{
    token: string;
    user: User;
  }>;
  findAdminByEmail: (email: string) => Promise<Admin | null>;
  generateToken: (payload: TokenPayload, secret: string) => string;
  adminRegister: (payload: AdminRegisterPayload) => Promise<Admin>;
  adminLogin: (payload: LoginPayload) => Promise<{
    token: string;
    admin: Admin;
  }>;
}

export class AuthService implements IAuthService {
  constructor(
    private userService: IUserService,
    private adminRepo: Repository<Admin>
  ) {}

  async login(payload: LoginPayload) {
    const user = await this.userService.userFindByEmail(payload.email);

    if (!user) throw new AppError("user not found", "AUTH_INVALID_USER", 404);

    if (user.password !== payload.password) {
      throw new AppError("incorrect ", "AUTH_INVALID_USER", 400);
    }
    const token = this.generateToken(
      {
        email: user.email,
        id: user.id,
      },
      USER_TOKEN_SECRET
    );
    return {
      token,
      user: user,
    };
  }

  async findAdminByEmail(email: string) {
    return this.adminRepo.findOneBy({ email });
  }

  async adminRegister(payload: AdminRegisterPayload) {
    const newAdmin = this.adminRepo.create(payload);
    const admin = await this.adminRepo.save(newAdmin);
    return admin;
  }

  async adminLogin(payload: LoginPayload) {
    const admin = await this.findAdminByEmail(payload.email);

    if (!admin) throw new AppError("admin not found", "AUTH_INVALID_USER", 404);

    if (admin.password !== payload.password) {
      throw new AppError("incorrect ", "AUTH_INVALID_USER", 400);
    }
    const token = this.generateToken(
      {
        email: admin.email,
        id: admin.id,
      },
      ADMIN_TOKEN_SECRET
    );
    return {
      token,
      admin,
    };
  }

  generateToken = (user: TokenPayload, secret: string): string => {
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
      },
      secret
    );
    return token;
  };
}
