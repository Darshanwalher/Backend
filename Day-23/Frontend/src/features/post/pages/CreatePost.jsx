import React, { useRef, useState } from 'react'
import "../style/createPost.scss"
import {usePost} from "../hooks/usePost"
import {useNavigate} from "react-router"


const CreatePost = () => {
    const [caption, setCaption] = useState('');
    const postImageInputFieldRef = useRef(null)

    const {loading,handleCreatePost} = usePost();
    const navigate = useNavigate();


    function handleSubmmit(e){
        e.preventDefault();
        const file = postImageInputFieldRef.current.files[0];
        handleCreatePost(file,caption);
        setCaption('');
        navigate("/");
    }
    if(loading){
        return <h1>Loading</h1>
    }
  return (
    <main className='create-post-page'>
        <div className="form-container">
            <h1>Create Post</h1>
            <form onSubmit={handleSubmmit}>
                <label className='post-img-label' htmlFor="postImage">Select Yor Image</label>
                <input type="file" ref={postImageInputFieldRef} hidden name='postImage' id='postImage'/>
                <input value={caption} onChange={(e)=>{setCaption(e.target.value)}} type="text" name='caption' id='caption' placeholder='enter your caption' />
                <button type='submit' className='btn'>Create Post</button>
            </form>
        </div>
    </main>
  )
}

export default CreatePost
