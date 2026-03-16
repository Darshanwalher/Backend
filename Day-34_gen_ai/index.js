import dotenv from "dotenv";
dotenv.config();

import readline from "readline/promises";
import { ChatMistralAI } from "@langchain/mistralai";
import { HumanMessage } from "@langchain/core/messages";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const model = new ChatMistralAI({
  model: "mistral-small-latest",
});

const messages = [];

async function chat() {
  while (true) {
    const userInput = await rl.question("You: ");

    messages.push(new HumanMessage(userInput));

    const response = await model.invoke(messages);

    console.log("[AI]:", response.content);

    messages.push(response);
  }
}

chat();