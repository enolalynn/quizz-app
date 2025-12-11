import { Request, Response, NextFunction } from "express";

import jwt from "jsonwebtoken";
import { LoginPayload, TokenPayload } from "../types/auth.type";
import {
  ADMIN_TOKEN_SECRET,
  USER_TOKEN_SECRET,
} from "../constants/auth.constants";

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, USER_TOKEN_SECRET) as TokenPayload;
    if (!decoded) {
      return res.status(401).json({ message: "Provided token is invalid" });
    }
    req.user = decoded;

    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};

export const adminAuthenticate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, ADMIN_TOKEN_SECRET) as TokenPayload;
    if (!decoded) {
      return res.status(401).json({ message: "Provided token is invalid" });
    }
    req.user = decoded;

    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};

export const authorize = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    next();
  };
};
