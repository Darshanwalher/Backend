import "dotenv/config";
import { ChatMistralAI } from "@langchain/mistralai";
import { listFiles, readFiles, updateFiles } from "./tools.js";
import { createReactAgent } from "@langchain/langgraph/prebuilt";

const model = new ChatMistralAI({
    temperature: 0.2,
    model: "mistral-large-latest",
    apiKey: process.env.MISTRAL_API_KEY
});

const agent = createReactAgent({
    llm: model,
    tools: [listFiles, readFiles, updateFiles],
});

export default agent;



