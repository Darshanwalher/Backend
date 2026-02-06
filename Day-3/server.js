const express = require("express")

const app = express()

const notes=[]

app.get('/notes',(req,res)=>{
    res.send('Notes Created')
})

app.listen(3000,()=>{
    console.log("server is running on the port 3000"); 
})
