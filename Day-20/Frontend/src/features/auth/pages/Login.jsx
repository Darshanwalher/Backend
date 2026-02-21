import React from 'react'
import "../style/form.scss"
import { Link } from 'react-router'
import { useState } from 'react'
import axios from 'axios'
import { useAuth } from '../hooks/useAuth'

const Login = () => {

  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")

  const {handleLogin,loading} = useAuth();

  function handleSubmit(e){
    e.preventDefault();

    if(loading){
      return <h1>Loading...</h1>
    }

    handleLogin(username,password)  
    .then((response)=>{
      console.log(response);
      
    })
  }

  return (
    <main className="login-page">
      <div className="form-container">
        <div className="brand">
          <h1 className="brand__name">Social Space</h1>
          <p className="brand__tagline">Your world, your space, your story.</p>
        </div>

        <h2 className="title">Welcome Back</h2>

        <form className='form' onSubmit={handleSubmit}>
          <input onInput={(e)=>setUsername(e.target.value)} type="text" placeholder='Username' />
          <input onInput={(e)=>setPassword(e.target.value)} type="password" placeholder='Password' />
          <button type='submit'>Log In</button>
        </form>

        <p className="alt-action">
          Don't have an account?
          <Link to="/register" className="link-btn"> Register</Link>
        </p>
      </div>
    </main>
  )
}

export default Login