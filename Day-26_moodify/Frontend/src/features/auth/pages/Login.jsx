import React, { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import "../styles/login.scss"
import FormGroup from '../components/FormGroup';
import { useAuth } from '../hooks/useAuth';

const Login = () => {

    const {loading,handleLogin} = useAuth()

    const navigate = useNavigate()

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

     async function handleSubmit(e) {
        e.preventDefault()
        await handleLogin({ email, password })
        navigate("/")
    }

    return (
        <main className="login-page">
            <div className="background-visuals">
                <div className="blob"></div>
                <div className="blob"></div>
            </div>
            
            <div className="form-container">
                <div className="brand-header">
                    <span className="logo-icon">🎧</span>
                    <h1>Moodify</h1>
                    <p>Music that matches your vibe.</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <FormGroup
                     value={email}
                     onChange={(e)=>setEmail(e.target.value)}
                     label="Email" placeholder="Enter your email"/>
                    <FormGroup 
                    value={password}
                    onChange={(e)=>setPassword(e.target.value)}
                    label="Password" placeholder="Enter your password"/>
                    <button className="button" type="submit">Login</button>
                </form>

                <p className="footer-text">
                    Don't have an account? <Link to="/register">Register here</Link>
                </p>
            </div>
        </main>
    );
};

export default Login;