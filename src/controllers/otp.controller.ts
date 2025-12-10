import { Request, Response, NextFunction } from "express";
import { userRepository } from "../repositories/user.repository";
import { ApiResponse } from "../types/auth.type";
import {
  Email,
  IOTPService,
  OTPPayload,
  OTPService,
} from "../service/otp.service";
import { OTP } from "../model/otp";
import { otpRepository } from "../repositories/otp.repository";

export interface IOtpController {
  createOTP: (
    req: Request,
    res: Response
  ) => Promise<
    Response<
      ApiResponse<{
        message: string;
        data: OTP;
      }>
    >
  >;
}

export class OtpController implements IOtpController {
  private otpService: IOTPService;
  constructor() {
    this.otpService = new OTPService(userRepository, otpRepository);
  }

  createOTP = async (req: Request, res: Response) => {
    const payload: Email = req.body;
    const existOtp = await this.otpService.checkOTPStatus(payload.email);
    if (existOtp?.isUsed === false) {
      return res.status(200).json({
        message: "OTP created",
        data: existOtp,
      });
    }
    const otpCreated = await this.otpService.createOTP(payload);
    return res.status(200).json({
      message: "OTP created",
      data: otpCreated,
    });
  };
}
