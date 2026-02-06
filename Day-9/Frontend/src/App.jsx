import React, { useEffect, useState } from 'react'
import axios from "axios"
import './App.css'

const App = () => {

  const [notes, setNotes] = useState([])
  const [editId, setEditId] = useState(null)

  function fetchNotes(){
    axios.get("http://localhost:3000/api/notes")
      .then(res => {
        setNotes(res.data.notes)
      })
      .catch(err => console.log(err))
  }

  useEffect(()=>{
    fetchNotes()
  },[])

  function handleSubmit(e){
    e.preventDefault()

    const title = e.target.title.value
    const description = e.target.description.value

    // 👉 If editing note
    if(editId){
      axios.patch(`http://localhost:3000/api/notes/${editId}`, {
        title,
        description
      })
      .then(() => {
        fetchNotes()
        setEditId(null)
        e.target.reset()
      })
      .catch(err => console.log(err))
    }

    // 👉 If adding new note
    else{
      axios.post("http://localhost:3000/api/notes", {
        title,
        description
      })
      .then(() => {
        fetchNotes()
        e.target.reset()
      })
      .catch(err => console.log(err))
    }
  }

  function handleDeleteNote(noteId){
    axios.delete(`http://localhost:3000/api/notes/${noteId}`)
      .then(() => fetchNotes())
      .catch(err => console.log(err))
  }

  function handleUpdate(note){
    setEditId(note._id)

    // Fill form values
    document.querySelector('input[name="title"]').value = note.title
    document.querySelector('textarea[name="description"]').value = note.description
  }

  return (
    <div className="app">

      <h1 className="app-title">My Notes</h1>

      {/* Add/Edit form */}
      <form className="form-card" onSubmit={handleSubmit}>
        <input 
          type="text" 
          name="title"
          placeholder="Title" 
          required
        />

        <textarea 
          name="description"
          placeholder="Description"
          required
        />

        <button type="submit">
          {editId ? "Update Note" : "Add Note"}
        </button>
      </form>

      {/* Notes Grid */}
      <div className="notes-container">
        {notes.map((note) => (
          <div className="note-card" key={note._id}>
            <h2>{note.title}</h2>
            <p>{note.description}</p>

            <div className="btn-group">
              <button 
                className="delete-btn"
                onClick={() => handleDeleteNote(note._id)}
              >
                Delete
              </button>

              <button 
                className="update-btn"
                onClick={() => handleUpdate(note)}
              >
                Update
              </button>
            </div>
          </div>
        ))}
      </div>

    </div>
  )
}

export default App
