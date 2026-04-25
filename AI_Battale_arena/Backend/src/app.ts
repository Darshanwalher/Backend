import express from 'express';
import useGraph  from "./services/graph.ai.service.js"
import runGraph from "./services/graph.ai.service.js"
import { success } from 'zod';
import cors from 'cors';

const app = express();

app.use(cors({
    origin:"http://localhost:5173",
    methods:["GET","POST"],
    credentials:true
}));

app.use(express.json());

// app.post("/",async(req,res)=>{
//     const result = await runGraph("write the factorial program in javascript?");
//     res.json(result);
// })

app.post("/invoke",async(req,res)=>{
    const {input} = req.body;
    const result = await runGraph(input);
    res.json({
        message:"graph invoked successfully",
        success:true,
        result
    })
})


export default app;