import React, { useState } from 'react'
import "../style/form.scss"
import { Link } from 'react-router';
import {useAuth} from "../hooks/useAuth"
import { useNavigate } from 'react-router';

const Register = () => {

  const {loading,handleRegister} = useAuth()
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async(e) => {
    e.preventDefault();
    await handleRegister(username,email,password);
    console.log("user registered succssfully");
    navigate("/");
  };

   if(loading){
    return <h1>Loading...</h1>
  }

  return (

    <main className="login-page">
      <div className="form-container">
        <header className="brand-header">
          <h1>Social Space</h1>
          <p>Connect with your world.</p>
        </header>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <input 
              onInput={(e)=>setUsername(e.target.value)}
              type="text" 
              name='username' 
              id='username' 
              placeholder='Username ' 
              required 
            />
          </div>
          <div className="input-group">
            <input 
              onInput={(e)=>setEmail(e.target.value)}
              type="text" 
              name='email' 
              id='email' 
              placeholder='Email' 
              required 
            />
          </div>
          <div className="input-group">
            <input 
              onInput={(e)=>setPassword(e.target.value)}
              type="password" 
              name='password' 
              id='password' 
              placeholder='Password' 
              required 
            />
          </div>
          <button type='submit' className="login-btn">Sign Up</button>
        </form>

        <footer className="form-footer">
          <p>Do You have an account?<Link to="/login"> Log In</Link></p>
        </footer>
      </div>
    </main>
  )
}

export default Register
