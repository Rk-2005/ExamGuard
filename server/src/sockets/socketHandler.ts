import { Socket, Server } from "socket.io";
import { PrismaClient } from "../src/generated/prisma";

const prisma = new PrismaClient();

export const socketHandler = (socket: Socket, io: Server) => {
  console.log("User connected:", socket.id);

  // Admin joins the test room
  socket.on("admin-join-test", async ({ testCode }) => {
    try {
      const test = await prisma.test.findUnique({
        where: { code: testCode },
        select: { id: true, code: true, title: true },
      });

      if (!test) {
        socket.emit("error", { message: "Test not found" });
        return;
      }

      socket.join(`test-${testCode}`);
      console.log(`Admin joined room test-${testCode}`);

      const attempts = await prisma.testAttempt.findMany({
        where: { testId: test.id },
        include: { 
          user: true,
          violations: true  // Include violations to get count
        },
        orderBy: { startedAt: "desc" },
      });

      const uniqueAttempts = attempts.reduce((acc, attempt) => {
        if (!acc.has(attempt.userId)) {
          acc.set(attempt.userId, attempt);
        }
        return acc;
      }, new Map<number, (typeof attempts)[0]>());

      socket.emit(
        "student-list",
        Array.from(uniqueAttempts.values()).map((attempt) => ({
          id: attempt.user.id,
          name: attempt.user.name,
          email: attempt.user.email,
          status: "online",
          tabSwitchCount: attempt.violations.length, // Get real violation count
          socketId: socket.id
        }))
      );
    } catch (error) {
      console.error("Error in admin-join-test:", error);
      socket.emit("error", { message: "Internal server error" });
    }
  });

  // Student joins the test
  socket.on("student-join-test", async ({ testCode, userId }) => {
    console.log("user joined");
    try {
      const test = await prisma.test.findUnique({
        where: { code: testCode },
        select: { id: true },
      });

      if (!test) {
        socket.emit("error", { message: "Test not found" });
        return;
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, name: true, email: true },
      });

      if (!user) {
        socket.emit("error", { message: "User not found" });
        return;
      }

      await prisma.testAttempt.create({
        data: {
          testId: test.id,
          userId: user.id,
        },
      });

      console.log("Student created test attempt");
      socket.join(`test-${testCode}`);
      console.log(`Student ${user.name} joined room test-${testCode}`);
      console.log(user.name);
      socket.to(`test-${testCode}`).emit("student-joined", {
        id: user.id,
        name: user.name,
        email: user.email,
        status: "online",
        tabSwitchCount: 0,
        socketId: socket.id
      });

      socket.emit("join-success", {
        message: "Successfully joined the test",
        testCode,
      });
    } catch (error) {
      console.error("Error in student-join-test:", error);
      socket.emit("error", { message: "Internal server error" });
    }
  });

  // Admin starts the test
  socket.on("admin-start-test", async ({ testCode ,questions,testId}) => {
    try {
      const test = await prisma.test.findUnique({
        where: { code: testCode }
      });

      console.log("Test found:", !!test);
      console.log("Test ID:", test?.id);

      if (!test) {
        socket.emit("error", { message: "Test not found" });
        return;
      }
      const createdQuestions = await prisma.$transaction( 
      questions.map((q: any) =>
        prisma.question.create({
          data: {
            text: q.text,
            options: q.options,
            answer: q.correctAnswer, // Match frontend field
            testId: parseInt(testId),
          },
        })
      )
    );

  console.log("question db m gye",createdQuestions);
      // ✅ FIXED: Use dynamic test ID instead of hardcoded 50
   
      console.log("Questions found:", questions.length);
      console.log("Questions:", questions);

      await prisma.test.update({
        where: { id: test.id },
        data: { isActive: true },
      });

      io.to(`test-${testCode}`).emit("test-started", {
        testTitle: test.title,
        duration: test.duration*60,
        questions: createdQuestions,
        startTime: new Date().toISOString(),
      });

      console.log(
        `Test ${testCode} started with ${questions.length} questions`
      );
    } catch (error) {
      console.error("Error in admin-start-test:", error);
      socket.emit("error", { message: "Failed to start test" });
    }
  });

  // Student submits an answer
  socket.on("student-submit-answer", async ({ testCode, userId, questionId, selected }) => {
    console.log(testCode)
    console.log(userId)
    console.log(questionId)
    console.log(selected) 
    try {
      const test = await prisma.test.findUnique({
        where: { code: testCode },
        select: { id: true },
      });

      if (!test) return;

      const attempt = await prisma.testAttempt.findFirst({
        where: {
          testId: test.id,
          userId,
          submittedAt: undefined,
        },
        orderBy: { startedAt: "desc" },
      });

      if (!attempt) return;

      await prisma.answer.create({
        data: {
          attemptId: attempt.id,
          questionId,
          selected,

        },
      });

      console.log(`Answer recorded for user ${userId} on question ${questionId}`);
    } catch (error) {
      console.error("Error recording answer:", error);
    }
  });

  // ✅ FIXED: Student tab violation with proper admin update
  socket.on("student-tab-violation", async ({ testCode, userId, reason }) => {
    try {
      const test = await prisma.test.findUnique({
        where: { code: testCode },
        select: { id: true },
      });

      if (!test) return;

      const attempt = await prisma.testAttempt.findFirst({
        where: {
          testId: test.id,
          userId
        },
        include: {
          user: true,
          violations: true
        },
        orderBy: { startedAt: "desc" },
      });

      if (!attempt) return;

      // Record the violation
      await prisma.tabViolation.create({
        data: {
          attemptId: attempt.id,
          reason,
        },
      });

      // Get updated violation count
      const updatedAttempt = await prisma.testAttempt.findFirst({
        where: {
          testId: test.id,
          userId
        },
        include: {
          user: true,
          violations: true
        },
        orderBy: { startedAt: "desc" },
      });

      // ✅ NEW: Send updated student data to admin with current violation count
      socket.to(`test-${testCode}`).emit("student-updated", {
        id: userId,
        name: updatedAttempt.user.name,
        email: updatedAttempt.user.email,
        status: "online",
        tabSwitchCount: updatedAttempt?.violations.length, // Updated count
        socketId: socket.id
      });

      // Also send the violation event (for additional handling if needed)
      socket.to(`test-${testCode}`).emit("student-violation", {
        userId,
        violation: reason,
        newCount: updatedAttempt?.violations.length
      });

      console.log(`Violation recorded for user ${userId}: ${reason}. Total violations: ${updatedAttempt?.violations.length}`);

    } catch (error) {
      console.error("Error recording violation:", error);
    }
  });

  // Admin ends test
  socket.on("admin-end-test", async ({ testCode }) => {
    try {
      const test = await prisma.test.findUnique({
        where: { code: testCode },
        select: { id: true },
      });

      if (!test) return;

      await prisma.test.update({
        where: { id: test.id },
        data: { isActive: false },
      });

      const attempts = await prisma.testAttempt.findMany({
        where: {
          testId: test.id,
          submittedAt: undefined,
        },
        include: {
          answers: {
            include: { question: true },
          },
        },
      });

      for (const attempt of attempts) {
        const score = attempt.answers.reduce(
          (total, answer) => total + (answer.selected === answer.question.answer ? 1 : 0),
          0
        );

        await prisma.testAttempt.update({
          where: { id: attempt.id },
          data: {
            Score: score,
            submittedAt: new Date(),
          },
        });
      }

      io.to(`test-${testCode}`).emit("test-ended");
      console.log(`Test ${testCode} ended by admin`);
    } catch (error) {
      console.error("Error in admin-end-test:", error);
      socket.emit("error", { message: "Internal server error" });
    }
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
};