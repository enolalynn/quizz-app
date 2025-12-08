import { LoginPayload } from "./auth.type";

declare global {
  namespace Express {
    interface Request {
      user?: LoginPayload;
      loginTime?: number;
    }
  }
}
