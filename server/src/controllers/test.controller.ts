import { Request, Response } from "express";
import { PrismaClient } from "../src/generated/prisma";

const prisma=new PrismaClient();

interface AuthRequest extends Request {
    id: number;
    role: string;
}

export const createTest=async (req:AuthRequest,res:any)=>{
    const {title,description,code}=req.body;
    
    const creatorId=req.id;

    console.log(creatorId+ " hua ky")

    try{
        const test=await prisma.test.create({
            data:{
                title,
                description,
                code,
                creatorId
            }
        });
        console.log(test)
         return res.status(201).json(test);
    }catch(e){
         return res.status(500).json({ error: 'Failed to create test' });
    }
    
}


export const addQuestion= async (req:Request,res:any)=>{
    const { testId } = req.params;
    const {text,options,answer}=req.body;

    try{
        const questions= await prisma.question.create({
            data:{
                text,
                options,
                answer,
                testId:parseInt(testId)
            }
        })
        return res.status(200).json(questions);
    }
    catch(error){
        return res.status(500).json({ error: 'Failed to add question' });
    }
}

