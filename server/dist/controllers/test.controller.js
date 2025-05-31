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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUsers = exports.joinTest = exports.getViolation = exports.reportViolation = exports.getAttemptById = exports.getUserAttempts = exports.submitAnswers = exports.getTestById = exports.getUserTests = exports.addQuestion = exports.createTest = void 0;
const prisma_1 = require("../src/generated/prisma");
const prisma = new prisma_1.PrismaClient();
const createTest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { title, description, code, duration } = req.body;
    const creatorId = req.id;
    console.log(creatorId + " hua ky");
    try {
        const test = yield prisma.test.create({
            data: {
                title,
                description,
                code,
                creatorId,
                duration,
            },
        });
        console.log("ye test hai " + test);
        return res.status(201).json(test);
    }
    catch (e) {
        return res.status(500).json({ error: "Failed to create test" });
    }
});
exports.createTest = createTest;
const addQuestion = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { testId } = req.params;
    const { text, options, answer } = req.body;
    console.log("add que mai aa gya ");
    console.log(testId + " " + text + " " + options + " " + answer);
    try {
        const questions = yield prisma.question.create({
            data: {
                text,
                options,
                answer,
                testId: parseInt(testId),
            },
        });
        console.log(questions);
        return res.status(200).json(questions);
    }
    catch (error) {
        return res.status(500).json({ error: "Failed to add question" + error });
    }
});
exports.addQuestion = addQuestion;
const getUserTests = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user_id = req.id;
    try {
        const test = yield prisma.test.findMany({
            where: {
                creatorId: user_id,
            },
            select: {
                id: true,
                title: true,
                description: true,
                questions: true,
                creator: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
            },
        });
        res.status(200).json(test);
    }
    catch (err) {
        return res.status(500).json({ error: "Failed to fetch tests" });
    }
});
exports.getUserTests = getUserTests;
const getTestById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const test_id = parseInt(id);
        const test = yield prisma.test.findUnique({
            where: {
                id: test_id,
            },
            select: {
                questions: {
                    select: {
                        id: true,
                        text: true,
                        options: true,
                    },
                },
            },
        });
        if (!test) {
            return res.status(404).json({ msg: "Test not found" });
        }
        res.status(200).send(test);
    }
    catch (err) {
        res.status(404).json({
            msg: "Invalid id ",
        });
    }
});
exports.getTestById = getTestById;
const submitAnswers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.id;
    const testId = parseInt(req.params.id);
    const { answers } = req.body;
    console.log(testId);
    if (userId === undefined) {
        return res.status(401).json({ error: "User not authenticated" });
    }
    try {
        const attempt = yield prisma.testAttempt.create({
            data: {
                userId: userId,
                testId,
            },
        });
        if (!attempt) {
            return res.status(404).send("error");
        }
        const answerdata = answers.map((ans) => ({
            attemptId: attempt.id,
            questionId: ans.questionId,
            selected: ans.selected,
        }));
        yield prisma.answer.createMany({
            data: answerdata,
        });
        const questionsid = answers.map((a) => a.questionId);
        const correctque = prisma.question.findMany({
            where: { id: { in: questionsid } },
            select: {
                id: true,
                answer: true,
            },
        });
        let score = 0;
        (yield correctque).forEach((q) => {
            const userans = answers.find((a) => a.questionId == q.id);
            if ((userans === null || userans === void 0 ? void 0 : userans.selected) == q.answer) {
                score++;
            }
        });
        yield prisma.testAttempt.update({
            where: { id: attempt.id },
            data: {
                userId: userId,
                testId,
                Score: score,
            },
        });
        return res.status(200).json({
            message: "Test submitted successfully",
            attemptId: attempt.id,
            score,
        });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Failed to submit test" });
    }
});
exports.submitAnswers = submitAnswers;
const getUserAttempts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user_id = req.id;
    try {
        const tests = yield prisma.test.findMany({
            where: { creatorId: user_id },
        });
        res.status(200).json({
            tests,
        });
    }
    catch (e) {
        res.status(404).send("Error or invalid id");
    }
});
exports.getUserAttempts = getUserAttempts;
const getAttemptById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const attemptId = parseInt(req.params.attemptId);
    try {
        const attempt = yield prisma.testAttempt.findUnique({
            where: { id: attemptId },
            include: {
                test: {
                    select: { title: true },
                },
                answers: {
                    include: {
                        question: {
                            select: {
                                text: true,
                                options: true,
                                answer: true,
                            },
                        },
                    },
                },
            },
        });
        if (!attempt) {
            return res.status(404).send("Error");
        }
        const detailedAnswers = attempt.answers.map((a) => ({
            question: a.question.text,
            options: a.question.options,
            correctAnswer: a.question.answer,
            userSelected: a.selected,
            isCorrect: a.selected === a.question.answer,
        }));
        res.status(200).json({
            testTitle: attempt.test.title,
            score: attempt.Score,
            submittedAt: attempt.submittedAt,
            answers: detailedAnswers,
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch attempt details" });
    }
});
exports.getAttemptById = getAttemptById;
const reportViolation = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { attemptId } = req.params;
    const { reason } = req.body;
    try {
        const violation = yield prisma.tabViolation.create({
            data: {
                attemptId: parseInt(attemptId),
                reason,
            },
        });
        res.status(200).json({
            message: "Vilation created",
            violation,
        });
    }
    catch (e) {
        return res.status(404).send("error");
    }
});
exports.reportViolation = reportViolation;
const getViolation = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { attemptId } = req.params;
    try {
        const violation = yield prisma.testAttempt.findMany({
            where: { id: parseInt(attemptId) },
            include: {
                violations: true,
            },
        });
        res.status(200).json({
            violation,
        });
    }
    catch (e) {
        return res.status(500).send(e);
    }
});
exports.getViolation = getViolation;
const joinTest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { code } = req.body;
    console.log(code);
    if (!req.id) {
        return res.status(401).json({ msg: "Unauthorized: user ID not found" });
    }
    try {
        const test = yield prisma.test.findUnique({
            where: { code },
            select: {
                id: true,
                title: true,
                description: true,
                duration: true,
                questions: {
                    select: {
                        id: true,
                        text: true,
                        options: true,
                    },
                },
            },
        });
        if (!test) {
            return res.status(404).json({ msg: "Test not found" });
        }
        const attempt = yield prisma.testAttempt.create({
            data: {
                testId: test.id,
                userId: req.id,
            },
        });
        res.status(200).json(Object.assign({ attemptId: attempt.id }, test));
    }
    catch (error) {
        res.status(500).json({ msg: "Server error", error });
    }
});
exports.joinTest = joinTest;
const getUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { code } = req.params;
    console.log(code);
    try {
        const test = yield prisma.test.findUnique({
            where: { code: code },
            include: {
                attempts: {
                    select: {
                        user: true,
                    },
                },
            },
        });
        if (!test) {
            return res.status(404).json({ message: "Test not found" });
        }
        // Extract users from attempts
        const users = test.attempts.map((a) => a.user);
        return res.status(200).json({ users });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error" });
    }
});
exports.getUsers = getUsers;
