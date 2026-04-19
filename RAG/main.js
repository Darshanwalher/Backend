import {PDFParse} from "pdf-parse";
import fs from "fs";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { Pinecone } from '@pinecone-database/pinecone'
import {MistralAIEmbeddings} from "@langchain/mistralai"
import dotenv from "dotenv";
dotenv.config();

const pc = new Pinecone({ 
    apiKey: process.env.PINECONE_API_KEY
 });

 const index = pc.index("cohort2-rag")


// let dataBuffer = fs.readFileSync("./story.pdf");

// const parser = new PDFParse({
//     data: dataBuffer
// });

// const data = await parser.getText();

const embedding = new MistralAIEmbeddings({
    apiKey:process.env.MISTRAL_API_KEY,
    model:"mistral-embed",
})

// const splitter = new RecursiveCharacterTextSplitter({
//     chunkSize:100,
//     chunkOverlap: 0,
    
// })

// const chunks = await splitter.splitText(data.text);

// const docs = await Promise.all(chunks.map(async (chunk) => {
//     const embeddingResult = await embedding.embedQuery(chunk);
//     return {
//         text: chunk,
//         embedding: embeddingResult
//     };
// }));

// const result = await index.upsert({
//     records: docs.map((doc, idx) => ({
//         id: `doc-${idx}`,
//         values: doc.embedding,
//         metadata: {
//             text: doc.text
//         }
//     }))
// })

const queryEmbedding = await embedding.embedQuery("who was the aarav intership experience ?");

const queryResult = await index.query({
    vector: queryEmbedding,
    topK: 2,
    includeMetadata: true
})


console.log(JSON.stringify(queryResult));