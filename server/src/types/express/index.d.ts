// types/express/index.d.ts
import { Request } from "express";

declare module "express-serve-static-core" {
  interface Request {
    id?: number;
    role?: string;
  }
}
