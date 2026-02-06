const express = require('express')

const app = express()
app.use(express.json())

const notes = []

app.get('/',(req,res)=>{
    res.send("hello world")
})

app.post("/notes",(req,res)=>{
    notes.push(req.body)
    

    res.send("note created");
    console.log(notes);     
})

app.get("/notes",(req,res)=>{
    res.send(notes)
})

app.delete("/notes/:index",(req,res)=>{
   delete notes[req.params.index]

   res.send("note is deleted");

})

app.patch("/notes/:index",(req,res)=>{
    notes[req.params.index].description = req.body.description
    
    res.send("note updated susessfully")
})

module.exports = app;


