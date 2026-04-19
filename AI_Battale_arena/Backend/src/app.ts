import express from 'express';
import useGraph  from "./services/graph.ai.service.js"
import runGraph from "./services/graph.ai.service.js"

const app = express();

app.use(express.json());

app.post("/",async(req,res)=>{
    const result = await runGraph("write the factorial program in javascript?");
    res.json(result);
})


export default app;