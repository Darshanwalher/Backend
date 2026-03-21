import dotenv from "dotenv";
dotenv.config();
import {tavily} from "@tavily/core"


const tvly = tavily({
    apiKey:process.env.TAVILY_API_KEY,
})

export const searchInternet = async({query})=>{
    const response =  await tvly.search(query,{
        maxResults:5,
        searchDepth:"advanced"
    });

    return JSON.stringify(response)

}