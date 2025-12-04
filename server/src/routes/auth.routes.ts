import express from 'express';
import  {signup,login}  from '../controllers/auth.controller';
import { authRateLimiter } from '../middleware/rate-limit.middleware';


const router=express.Router();
router.use(express.json());

router.post("/signup", authRateLimiter, signup);
router.post("/login", authRateLimiter, login);

export default router;
