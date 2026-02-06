const express = require("express")
const cors = require('cors')
const path = require("path")
const noteModel = require("./models/note.model")

const app = express()
app.use(cors())
app.use(express.json())
app.use(express.static("./public"))

app.post('/api/notes', async (req, res) => {
    const { title, description } = req.body

    const note = await noteModel.create({
        title,
        description
    })

    res.status(201).json({
        message: "note created successfully",
        note,
    })
})

app.get('/api/notes',async(req,res)=>{
    const notes = await noteModel.find()

    res.status(200).json({
        message:"notes fetch successfully",
        notes,
    })
})

app.delete('/api/notes/:id',async(req,res)=>{
    const id = req.params.id;

    await noteModel.findByIdAndDelete(id);

    res.status(200).json({
        message:"note deleted successfully",
    })
})

app.patch('/api/notes/:id', async (req, res) => {
    const id = req.params.id;
    const { description } = req.body;

    await noteModel.findByIdAndUpdate(id, { description });

    res.status(200).json({
        message: "description updated successfully",
    });
});



app.use("*name",(req,res)=>{
    res.sendFile(path.join(__dirname,"..","/public/index.html"))
})

module.exports = app
