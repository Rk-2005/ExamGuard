import { Request, Response } from "express";
import { PrismaClient } from "../src/generated/prisma";

const prisma = new PrismaClient();

interface AuthRequest extends Request {
  id: number;
  role: string;
}

export const createTest = async (req: AuthRequest, res: any) => {
  const { title, description, code } = req.body;

  const creatorId = req.id;

  console.log(creatorId + " hua ky");

  try {
    const test = await prisma.test.create({
      data: {
        title,
        description,
        code,
        creatorId,
      },
    });
    console.log(test);
    return res.status(201).json(test);
  } catch (e) {
    return res.status(500).json({ error: "Failed to create test" });
  }
};

export const addQuestion = async (req: Request, res: any) => {
  const { testId } = req.params;
  const { text, options, answer } = req.body;

  try {
    const questions = await prisma.question.create({
      data: {
        text,
        options,
        answer,
        testId: parseInt(testId),
      },
    });
    return res.status(200).json(questions);
  } catch (error) {
    return res.status(500).json({ error: "Failed to add question" });
  }
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


export const getTestById=async(req:Request,res:any)=>{
  const {id}=req.params;
   try{
  const test_id=parseInt(id);
 
  const test=await prisma.test.findUnique({
    where:{
      id:test_id
    },
    select:{
      questions:{
        select:{
          id:true,
          text:true,
          options:true,
        }
      }
    }
  })
  if (!test) {
      return res.status(404).json({ msg: "Test not found" });
    }

  res.status(200).send(test);
}catch(err){
  res.status(404).json({
    msg:"Invalid id "
  })
}

}

export const submitAnswers=async(req:Request,res:any)=>{
  const userId=(req.id);
  const testId=parseInt(req.params.id)  
  const {answers}=req.body;
console.log(testId)
 if (userId === undefined) {
  return res.status(401).json({ error: "User not authenticated" });
}
  try{
     const attempt= await prisma.testAttempt.create({
      data:{
        userId:userId,
        testId
      }
     })
     
     if(!attempt){
      return res.status(404).send("error");
     }
     
     const answerdata=answers.map((ans:{questionId: number; selected: string})=>({
      attemptId:attempt.id,
      questionId: ans.questionId,
      selected: ans.selected,
     }));
     
     await prisma.answer.createMany({
      data:answerdata
     })
    const questionsid=answers.map((a:{questionId:number})=>a.questionId)

    const correctque=prisma.question.findMany({
      where:{id:{in:questionsid}},
      select:{
        id:true,
        answer:true
      }
    })
    let score=0;
    (await correctque).forEach((q)=>{
      const userans=answers.find((a:any)=>a.questionId==q.id);
      if(userans?.selected==q.answer){
        score++;
      }
    })
   await prisma.testAttempt.update({
    where:{id:attempt.id},
    data:{
      userId:userId,
      testId,
      Score:score,
    }
   })
     return res.status(200).json({
      message: "Test submitted successfully",
      attemptId: attempt.id,
      score,
    });

  }catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to submit test" });
  }
}

export const getUserAttempts=async(req:Request,res:any)=>{
  const user_id=req.id;
  
  try{
  const tests=await prisma.test.findMany({
    where:{creatorId:user_id}
  })

  res.status(200).json({
    tests
  })
}catch(e){
  res.status(404).send("Error or invalid id");
}
}

export const getAttemptById=async (req:Request,res:any)=>{
  const attemptId = parseInt(req.params.attemptId);
  
  try{
    const attempt=await prisma.testAttempt.findUnique({
      where:{id:attemptId},
      include:{
        test:{
          select:{title:true}
        },
        answers:{
          include:{
            question:{
              select:{
                text:true,
                options:true,
                answer:true
              }
            }
          }
        }
      }
    })
    if(!attempt){
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
}

export const reportViolation=async (req:Request,res:any)=>{
  const {attemptId}=req.params;
  const {reason}=req.body;
  try{
    const violation=await prisma.tabViolation.create({
      data:{
        attemptId:parseInt(attemptId),
        reason
      }
    })
    res.status(200).json({
      message:"Vilation created",
      violation
    })
  }
catch(e){
return    res.status(404).send("error")
  }
}

export const getViolation=async(req:Request,res:any)=>{
  const {attemptId}=req.params;
  try{
  const violation=await prisma.testAttempt.findMany({
    where:{id:parseInt(attemptId)},
    include:{
      violations:true
    }
  })
  res.status(200).json({
    violation
  })
}catch(e){
  return res.status(500).send(e);
}

}