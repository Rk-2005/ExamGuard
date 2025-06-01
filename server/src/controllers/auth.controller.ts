import { Request, Response } from "express";
import { PrismaClient } from "../src/generated/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "Ronak";

export const signup = async (req: Request, res: any) => {
  console.log(req.body)
  const { email, password, name, Role } = req.body;

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
  const { email, password } = req.body;

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
