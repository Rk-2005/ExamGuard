
import express from "express"
import { requireAdmin, verify } from "../middleware/auth.middleware";
import { addQuestion, createTest, getAttemptById, getTestById, getUserAttempts, getUserTests, getViolation, reportViolation, submitAnswers } from "../controllers/test.controller";


const router=express.Router();
//GET /api/test/attempts/:attemptId/violations
router.get("/attempts/:attemptId/violation", verify, getViolation);
router.post("/:attemptId/violation", verify, reportViolation);
router.post("/attempts",verify,getUserAttempts);
router.get("/attempts/:attemptId",verify,getAttemptById);
router.post("/create",verify,requireAdmin,createTest);
router.post("/:testId/questions",verify, requireAdmin, addQuestion)
router.post("/my-tests",verify,getUserTests);
router.post("/:id",verify,getTestById);
router.post("/:id/submit",verify,submitAnswers);


export default router