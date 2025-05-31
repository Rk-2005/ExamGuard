"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = exports.signup = void 0;
const prisma_1 = require("../src/generated/prisma");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma = new prisma_1.PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "Ronak";
const signup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password, name, Role } = req.body;
    try {
        const existingUser = yield prisma.user.findUnique({
            where: { email },
        });
        if (existingUser) {
            return res.status(400).json({ error: "User already exists" });
        }
        const hashedPassword = bcryptjs_1.default.hashSync(password, 10);
        const user = yield prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                Role,
                name,
            },
        });
        const token = jsonwebtoken_1.default.sign({ id: user.id, role: user.Role }, JWT_SECRET);
        return res.status(200).json({ token });
    }
    catch (e) {
        console.error(e);
        return res.status(500).json({ error: "Signup failed" });
    }
});
exports.signup = signup;
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    try {
        const user = yield prisma.user.findUnique({
            where: { email },
        });
        if (!user) {
            return res.status(404).json({
                msg: "User doesn't exist",
            });
        }
        const pw = yield bcryptjs_1.default.compare(password, user.password);
        if (!pw) {
            return res.status(400).json({ error: "Invalid credentials" });
        }
        const token = jsonwebtoken_1.default.sign({ id: user.id, role: user.Role }, JWT_SECRET, {
            expiresIn: "7d",
        });
        return res.status(200).json({ token, user });
    }
    catch (err) {
        return res.status(500).json({ error: "Login failed" });
    }
});
exports.login = login;
