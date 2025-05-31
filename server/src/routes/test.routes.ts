
import express from "express"
import { requireAdmin, verify } from "../middleware/auth.middleware";
import { addQuestion, createTest, getAllTests, getAttemptById, getTestById, getTestsByAdmin, getUserAttempts, getUsers, getUserTests, getViolation, joinTest, reportViolation, submitAnswers } from "../controllers/test.controller";


const router=express.Router();
//GET /api/test/attempts/:attemptId/violations
//router.post("/join-test", verify, joinTest);
router.get("/attempts/:attemptId/violation", verify, getViolation);
router.post("/:attemptId/violation", verify, reportViolation);
router.post("/attempts",verify,getUserAttempts);
router.get("/attempts/:attemptId",verify,getAttemptById);
router.post("/create",verify,requireAdmin,createTest);
router.post("/:testId/questions",verify, requireAdmin, addQuestion)
router.post("/my-tests",verify,getUserTests);
router.post("/:id",verify,getTestById);
router.post("/:id/submit",verify,submitAnswers);
router.get("/:code/attempts",verify,getUsers);
router.get("/test-results/:testId",verify,requireAdmin,getAllTests)
router.get("/my-tests/",verify,requireAdmin,getTestsByAdmin)
export default router