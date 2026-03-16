import app from "./src/app.js"
import connectToDB from "./src/config/database.js"
import { testAi } from "./src/service/ai.service.js"


connectToDB()
    
testAi()

app.listen(3000,()=>{
    console.log("server is running on port 3000")
})