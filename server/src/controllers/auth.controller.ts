import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { signupSchema, loginSchema } from "../validators/auth.validator";
import prisma from "../lib/prisma";

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is not set");
}
const JWT_SECRET = process.env.JWT_SECRET;

export const signup = async (req: Request, res: any) => {
  console.log(req.body)
  
  // Validate input
  const validation = signupSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ error: validation.error.issues[0].message });
  }

  const { email, password, name, Role } = validation.data;

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        Role,
        name,
      },
    });

    const token = jwt.sign({ id: user.id, role: user.Role,Email:email}, JWT_SECRET);

    return res.status(200).json({ token });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Signup failed" });
  }
};

export const login = async (req: Request, res: any) => {
  // Validate input
  const validation = loginSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ error: validation.error.issues[0].message });
  }

  const { email, password } = validation.data;

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({
        msg: "User doesn't exist",
      });
    }

    const pw = await bcrypt.compare(password, user.password);
    if (!pw) {
      return res.status(400).json({ error: "Invalid credentials" });
    }
    const token = jwt.sign({ id: user.id, role: user.Role,email:email,name:user.name }, JWT_SECRET, {
      expiresIn: "7d",
    });
    return res.status(200).json({ token, user });
  } catch (err) {
    return res.status(500).json({ error: "Login failed" });
  }
};
