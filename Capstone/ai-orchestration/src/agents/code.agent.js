import "dotenv/config";
import { ChatMistralAI } from "@langchain/mistralai";
import { listFiles, readFiles, updateFiles } from "./tools.js";
import { createAgent } from "langchain";

const model = new ChatMistralAI({
    temperature: 0.7,
    model: "mistral-medium-latest",
    apiKey: process.env.MISTRAL_API_KEY
});

const agent = createAgent({
    model,
    tools: [listFiles, readFiles, updateFiles],
    
});

const result = await agent.invoke({
    messages: [
        {
            role: "user",
            content: "create a somple snake game using react and css use dark theme"
        }
    ]
});

