import React from 'react'
import "../style/form.scss"
import { Link } from 'react-router';

const Register = () => {

  const handleSubmit = (e) => {
    e.preventDefault();
  };
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
              type="text" 
              name='username' 
              id='username' 
              placeholder='Username ' 
              required 
            />
          </div>
          <div className="input-group">
            <input 
              type="text" 
              name='email' 
              id='email' 
              placeholder='Email' 
              required 
            />
          </div>
          <div className="input-group">
            <input 
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
