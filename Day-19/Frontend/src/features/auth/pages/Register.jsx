import React, { useEffect, useState } from 'react'
import "../style/form.scss"
import { Link } from 'react-router'
import axios from 'axios'

const Register = () => {

  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  async function handleSubmit(e){
        e.preventDefault()

         axios.post("http://localhost:3000/api/auth/register",{
            username,
            email,
            password,
        },{
            withCredentials:true
        })
        .then(res => {
            console.log(res.data)
        })
    }
  return (
    <main className="login-page">
        <div className="form-container">
            <div className="brand">
              <h1 className="brand__name">Social Space</h1>
              <p className="brand__tagline">Your world, your space, your story.</p>
            </div>

            <h2 className="title">Create an Account</h2>

            <form className='form' onSubmit={handleSubmit}>
                <input onInput={(e)=>{setUsername(e.target.value)}} type="text" placeholder='Username' />
                <input onInput={(e)=>{setEmail(e.target.value)}} type="email" placeholder='Email' />
                <input onInput={(e)=>{setPassword(e.target.value)}} type="password" placeholder='Password' />
                <button>Register</button>
            </form>

            <p className="alt-action">
                Do you have an account?
                <Link to="/" className="link-btn"> Login</Link>
            </p>
        </div>
    </main>
  )
}

export default Register