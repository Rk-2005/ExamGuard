
import express from "express"
import { requireAdmin, verify } from "../middleware/auth.middleware";
import { addQuestion, createTest } from "../controllers/test.controller";


const router=express.Router();

router.post("/create",verify,requireAdmin,createTest);
router.post("/:testId/questions",verify, requireAdmin, addQuestion)
export default router