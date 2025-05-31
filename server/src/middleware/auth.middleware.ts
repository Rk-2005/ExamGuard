import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "Ronak"; // fallback in case env is not set


export const verify = async (req: Request, res: any, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({ error: "Authorization header missing" });
  }

  const token = authHeader.split(" ")[1]; // Bearer <token>
  
  if (!token) {
    return res.status(401).json({ error: "Token missing" });
  }
  

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {id:number};
    // You can attach the decoded info to req object if needed:
    
    req.id=decoded.id;
  
    next(); // Move to the next middleware or route handler
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
};

export const requireAdmin = (req: Request, res: any, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: "Authorization header missing" });
  }
  const token=authHeader.split(" ")[1];
  if(!token){
     return res.status(401).json({ error: "Token missing" });
  }
  try{
  const decoded = jwt.verify(token, JWT_SECRET) as { id: number; role: string };
  
  const role=decoded.role;
  console.log(role)
  if(role==="admin"){
    req.role=role;
    req.id=decoded.id;
    next();
  }else{
     return res.status(403).json({ error: "Access denied: Admins only" });
  }
  }catch(e){
    return res.status(401).json({ error: "Invalid or expired token" });
  }

};
