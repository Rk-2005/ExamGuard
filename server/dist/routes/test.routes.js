"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const test_controller_1 = require("../controllers/test.controller");
const router = express_1.default.Router();
//GET /api/test/attempts/:attemptId/violations
//router.post("/join-test", verify, joinTest);
router.get("/attempts/:attemptId/violation", auth_middleware_1.verify, test_controller_1.getViolation);
router.post("/:attemptId/violation", auth_middleware_1.verify, test_controller_1.reportViolation);
router.post("/attempts", auth_middleware_1.verify, test_controller_1.getUserAttempts);
router.get("/attempts/:attemptId", auth_middleware_1.verify, test_controller_1.getAttemptById);
router.post("/create", auth_middleware_1.verify, auth_middleware_1.requireAdmin, test_controller_1.createTest);
router.post("/:testId/questions", auth_middleware_1.verify, auth_middleware_1.requireAdmin, test_controller_1.addQuestion);
router.post("/my-tests", auth_middleware_1.verify, test_controller_1.getUserTests);
router.post("/:id", auth_middleware_1.verify, test_controller_1.getTestById);
router.post("/:id/submit", auth_middleware_1.verify, test_controller_1.submitAnswers);
router.get("/:code/attempts", auth_middleware_1.verify, test_controller_1.getUsers);
exports.default = router;
