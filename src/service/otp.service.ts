import { Repository } from "typeorm";
import { OTP } from "../model/otp";
import { otpRepository } from "../repositories/otp.repository";

export interface IOtpService {
    createOtp(email: string): Promise<OTP>;
    verifyOtp(email: string, otp: number): Promise<boolean>;
}

export class OtpService {


async verifyOtp(email: string, otp: number) {
    const record = await otpRepository.findOneBy({ email });

    if (!record) return false;

    if (record.isUsed) return false;

    if (record.otp !== otp) return false;

    record.isUsed = true;
    await otpRepository.save(record);

    return true;
  }
}