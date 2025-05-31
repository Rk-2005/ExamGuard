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
exports.socketHandler = void 0;
const prisma_1 = require("../src/generated/prisma");
const prisma = new prisma_1.PrismaClient();
const socketHandler = (socket, io) => {
    console.log("User connected:", socket.id);
    // Admin joins the test room
    socket.on("admin-join-test", (_a) => __awaiter(void 0, [_a], void 0, function* ({ testCode }) {
        try {
            const test = yield prisma.test.findUnique({
                where: { code: testCode },
                select: {
                    id: true,
                    code: true,
                    title: true,
                },
            });
            if (!test) {
                socket.emit("error", { message: "Test not found" });
                return;
            }
            socket.join(`test-${testCode}`);
            console.log(`Admin joined room test-${testCode}`);
            // Send current student list to admin
            const attempts = yield prisma.testAttempt.findMany({
                where: { testId: test.id },
                include: { user: true },
                orderBy: { startedAt: "desc" },
            });
            // Get unique latest attempts per user
            const uniqueAttempts = attempts.reduce((acc, attempt) => {
                if (!acc.has(attempt.userId)) {
                    acc.set(attempt.userId, attempt);
                }
                return acc;
            }, new Map());
            socket.emit("student-list", Array.from(uniqueAttempts.values()).map((attempt) => ({
                id: attempt.user.id,
                name: attempt.user.name,
                email: attempt.user.email,
                status: "online", // Initial status
                tabSwitchCount: 0, // Will be updated from violations
            })));
        }
        catch (error) {
            console.error("Error in admin-join-test:", error);
            socket.emit("error", { message: "Internal server error" });
        }
    }));
    // Student joins the test
    socket.on("student-join-test", (_a) => __awaiter(void 0, [_a], void 0, function* ({ testCode, userId }) {
        try {
            const test = yield prisma.test.findUnique({
                where: { code: testCode },
                select: { id: true },
            });
            if (!test) {
                socket.emit("error", { message: "Test not found" });
                return;
            }
            const user = yield prisma.user.findUnique({
                where: { id: userId },
                select: { id: true, name: true, email: true },
            });
            if (!user) {
                socket.emit("error", { message: "User not found" });
                return;
            }
            // Create test attempt
            yield prisma.testAttempt.create({
                data: {
                    testId: test.id,
                    userId: user.id,
                },
            });
            socket.join(`test-${testCode}`);
            console.log(`Student ${user.name} joined room test-${testCode}`);
            // Notify admin
            io.to(`test-${testCode}-admin`).emit("student-joined", {
                id: user.id,
                name: user.name,
                email: user.email,
                status: "online",
                tabSwitchCount: 0,
            });
        }
        catch (error) {
            console.error("Error in student-join-test:", error);
            socket.emit("error", { message: "Internal server error" });
        }
    }));
    // Admin starts the test
    socket.on("admin-start-test", (_a) => __awaiter(void 0, [_a], void 0, function* ({ testCode }) {
        try {
            const test = yield prisma.test.findUnique({
                where: { code: testCode },
                include: {
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
                socket.emit("error", { message: "Test not found" });
                return;
            }
            // Mark test as active in database
            yield prisma.test.update({
                where: { id: test.id },
                data: { isActive: true },
            });
            // Send questions to students
            io.to(`test-${testCode}`).emit("test-started", {
                testTitle: test.title,
                duration: test.duration,
                questions: test.questions,
                startTime: new Date().toISOString(),
            });
            console.log(`Test ${testCode} started with ${test.questions.length} questions`);
        }
        catch (error) {
            console.error("Error in admin-start-test:", error);
            socket.emit("error", { message: "Failed to start test" });
        }
    }));
    // Student submits answer
    socket.on("student-submit-answer", (_a) => __awaiter(void 0, [_a], void 0, function* ({ testCode, userId, questionId, selected }) {
        try {
            const test = yield prisma.test.findUnique({
                where: { code: testCode },
                select: { id: true },
            });
            if (!test)
                return;
            const attempt = yield prisma.testAttempt.findFirst({
                where: {
                    testId: test.id,
                    userId,
                    submittedAt: undefined,
                },
                orderBy: { startedAt: "desc" },
            });
            if (!attempt)
                return;
            yield prisma.answer.create({
                data: {
                    attemptId: attempt.id,
                    questionId,
                    selected,
                },
            });
            console.log(`Answer recorded for user ${userId} on question ${questionId}`);
        }
        catch (error) {
            console.error("Error recording answer:", error);
        }
    }));
    // Student tab violation
    socket.on("student-tab-violation", (_a) => __awaiter(void 0, [_a], void 0, function* ({ testCode, userId, reason }) {
        try {
            const test = yield prisma.test.findUnique({
                where: { code: testCode },
                select: { id: true },
            });
            if (!test)
                return;
            const attempt = yield prisma.testAttempt.findFirst({
                where: {
                    testId: test.id,
                    userId,
                },
                orderBy: { startedAt: "desc" },
            });
            if (!attempt)
                return;
            yield prisma.tabViolation.create({
                data: {
                    attemptId: attempt.id,
                    reason,
                },
            });
            // Notify admin
            io.to(`test-${testCode}-admin`).emit("student-violation", {
                userId,
                violation: reason,
            });
        }
        catch (error) {
            console.error("Error recording violation:", error);
        }
    }));
    // Admin ends test
    socket.on("admin-end-test", (_a) => __awaiter(void 0, [_a], void 0, function* ({ testCode }) {
        try {
            const test = yield prisma.test.findUnique({
                where: { code: testCode },
                select: { id: true },
            });
            if (!test)
                return;
            // Mark test as inactive
            yield prisma.test.update({
                where: { id: test.id },
                data: { isActive: false },
            });
            // Calculate scores
            const attempts = yield prisma.testAttempt.findMany({
                where: {
                    testId: test.id,
                    submittedAt: undefined,
                },
                include: {
                    answers: {
                        include: {
                            question: true,
                        },
                    },
                },
            });
            for (const attempt of attempts) {
                const score = attempt.answers.reduce((total, answer) => total + (answer.selected === answer.question.answer ? 1 : 0), 0);
                yield prisma.testAttempt.update({
                    where: { id: attempt.id },
                    data: {
                        Score: score,
                        submittedAt: new Date(),
                    },
                });
            }
            // Notify all participants
            io.to(`test-${testCode}`).emit("test-ended");
            console.log(`Test ${testCode} ended by admin`);
        }
        catch (error) {
            console.error("Error in admin-end-test:", error);
            socket.emit("error", { message: "Internal server error" });
        }
    }));
    // Handle disconnections
    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
        // No need for special handling since we're not tracking state in memory
    });
};
exports.socketHandler = socketHandler;
