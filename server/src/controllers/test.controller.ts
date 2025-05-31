import { Request, Response } from "express";
import { PrismaClient } from "../src/generated/prisma";
import { error } from "console";

const prisma = new PrismaClient();

interface AuthRequest extends Request {
  id: number;
  role: string;
}

export const createTest = async (req: AuthRequest, res: any) => {
  const { title, description, code, duration } = req.body;
  
  const creatorId = req.id;

  console.log(creatorId + " hua ky");
  const existingTest = await prisma.test.findUnique({
    where: { code },
  });

  if (existingTest) {
    return res
      .status(400)
      .json({ error: "Test with this code already exists" });
  }
  try {
    const test = await prisma.test.create({
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
  } catch (e) {
    return res.status(500).json({ error: "Failed to create test" + e });
  }
};

export const addQuestion = async (req: Request, res: any) => {
  const { testId } = req.params;
  const questions = req.body; // Should be an array
  console.log(testId+" iddd hai ")
  console.log("Received questions:", questions);

  try {
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

    return res.status(200).json(createdQuestions);
  } catch (error) {
    console.error("Error creating questions:", error);
    return res.status(500).json({ error: "Failed to add questions: " + error });
  }
};

export const getTestsByAdmin = async (req: Request, res: any) => {

  const adminId = req.id;

  const tests = await prisma.test.findMany({
    where: { creatorId: adminId },
    select: {
      id: true,
      title: true,
      description:true,
      duration:true,
      CreatedAt: true,
    },
  });

  res.status(200).json(tests);
};

export const getUserTests = async (req: Request, res: any) => {
  const user_id = req.id;

  try {
    const test = await prisma.test.findMany({
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
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch tests" });
  }
};

export const getTestById = async (req: Request, res: any) => {
  const { id } = req.params;
  try {
    const test_id = parseInt(id);

    const test = await prisma.test.findUnique({
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
  } catch (err) {
    res.status(404).json({
      msg: "Invalid id ",
    });
  }
};

export const submitAnswers = async (req: Request, res: any) => {
  const userId = req.id;
  const testId = parseInt(req.params.id);
  const { answers } = req.body;
  console.log(testId);
  if (userId === undefined) {
    return res.status(401).json({ error: "User not authenticated" });
  }
  try {
    const attempt = await prisma.testAttempt.create({
      data: {
        userId: userId,
        testId,
      },
    });

    if (!attempt) {
      return res.status(404).send("error");
    }

    const answerdata = answers.map(
      (ans: { questionId: number; selected: string }) => ({
        attemptId: attempt.id,
        questionId: ans.questionId,
        selected: ans.selected,
      })
    );

    await prisma.answer.createMany({
      data: answerdata,
    });
    const questionsid = answers.map(
      (a: { questionId: number }) => a.questionId
    );

    const correctque = prisma.question.findMany({
      where: { id: { in: questionsid } },
      select: {
        id: true,
        answer: true,
      },
    });
    let score = 0;
    (await correctque).forEach((q) => {
      const userans = answers.find((a: any) => a.questionId == q.id);
      if (userans?.selected == q.answer) {
        score++;
      }
    });
    await prisma.testAttempt.update({
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
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to submit test" });
  }
};

export const getUserAttempts = async (req: Request, res: any) => {
  const user_id = req.id;

  try {
    const tests = await prisma.test.findMany({
      where: { creatorId: user_id },
    });

    res.status(200).json({
      tests,
    });
  } catch (e) {
    res.status(404).send("Error or invalid id");
  }
};

export const getAttemptById = async (req: Request, res: any) => {
  const attemptId = parseInt(req.params.attemptId);

  try {
    const attempt = await prisma.testAttempt.findUnique({
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
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch attempt details" });
  }
};

export const reportViolation = async (req: Request, res: any) => {
  const { attemptId } = req.params;
  const { reason } = req.body;
  try {
    const violation = await prisma.tabViolation.create({
      data: {
        attemptId: parseInt(attemptId),
        reason,
      },
    });
    res.status(200).json({
      message: "Vilation created",
      violation,
    });
  } catch (e) {
    return res.status(404).send("error");
  }
};

export const getViolation = async (req: Request, res: any) => {
  const { attemptId } = req.params;
  try {
    const violation = await prisma.testAttempt.findMany({
      where: { id: parseInt(attemptId) },
      include: {
        violations: true,
      },
    });
    res.status(200).json({
      violation,
    });
  } catch (e) {
    return res.status(500).send(e);
  }
};

export const joinTest = async (req: Request, res: any) => {
  const { code } = req.body;
  console.log(code);
  if (!req.id) {
    return res.status(401).json({ msg: "Unauthorized: user ID not found" });
  }

  try {
    const test = await prisma.test.findUnique({
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
    const attempt = await prisma.testAttempt.create({
      data: {
        testId: test.id,
        userId: req.id,
      },
    });

    res.status(200).json({
      attemptId: attempt.id,
      ...test,
    });
  } catch (error) {
    res.status(500).json({ msg: "Server error", error });
  }
};

export const getAllTests = async (req: Request, res: any) => {
  try {
    const testId = parseInt(req.params.testId);
console.log(testId)
    const attempts = await prisma.testAttempt.findMany({
      where: { testId },
      include: {
        violations:true,
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        answers: {
          include: {
            question: true,
          },
        },
      },
    });
    
    const results = attempts.map((attempt) => {
      let score = 0;
      for (const answer of attempt.answers) {
        if (answer.selected === answer.question.answer) {
          score++;
        }
      }
      console.log(attempt.violations.length);
      return {
        name: attempt.user.name,
        email: attempt.user.email,
        score,
        totalQuestions: attempt.answers.length,
        submittedAt: attempt.submittedAt,
        totalViolations: attempt.violations.length,
      };
    });

    res.status(200).json(results);
  } catch (error) {
    console.error("Error fetching test results:", error);
    res.status(500).json({ error: "Failed to fetch test results" });
  }
};


export const getUsers = async (req: Request, res: any) => {
  const { code } = req.params;
  console.log(code);
  try {
    const test = await prisma.test.findUnique({
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
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};
