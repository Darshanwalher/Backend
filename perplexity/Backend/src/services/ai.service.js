import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatMistralAI} from "@langchain/mistralai"
import {HumanMessage,SystemMessage,AIMessage,tool,createAgent } from "langchain";
import { searchInternet } from "./internet.service.js";
import * as z from "zod"
import dotenv from "dotenv";
dotenv.config();


const GeminiModel = new ChatGoogleGenerativeAI({
    model: "gemini-2.5-flash-lite",
    apiKey: process.env.GEMINI_API_KEY
});

const mistralModel = new ChatMistralAI({
    model:"mistral-small-latest",
    apiKey:process.env.MISTRAL_API_KEY

})

const searchTool = tool(
    searchInternet,
    {
        name:"searchInternet",
        description:"tool used for searching the internet for information",
        schema:z.object({
            query:z.string().describe("the query to search for")
        })
    }
)

const agent = createAgent({
    model:GeminiModel,
    tools:[searchTool]
})


export async function genrateResponse(messages){
    const response = await agent.invoke({
        messages: [
            new SystemMessage(`
                You are a helpful and precise assistant for answering questions.
                If you don't know the answer, say you don't know. 
                If the question requires up-to-date information, use the "searchInternet" tool to get the latest information from the internet and then answer based on the search results.
            `),
            ...(messages.map(msg => {
                if (msg.role == "user") {
                    return new HumanMessage(msg.content)
                } else if (msg.role == "ai") {
                    return new AIMessage(msg.content)
                }
            })) ]
    });

    return response.messages[response.messages.length-1].text;
}

export async function genrateChatTitle(message){
    const response  = await mistralModel.invoke([
        new SystemMessage(`
            You are a helpful assistant that generates concise and descriptive titles for chat conversations.
            
            User will provide you with the first message of a chat conversation, and you will generate a title that captures the essence of the conversation in 2-4 words. The title should be clear, relevant, and engaging, giving users a quick understanding of the chat's topic.    
        `),

        new HumanMessage(`
            Generate a title for a chat conversation based on the following first message:
            "${message}"
        `)
    ])

    return response.text;
}