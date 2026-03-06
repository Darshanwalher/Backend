import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import FormGroup from '../components/FormGroup';
import '../styles/register.scss';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const Register = () => {
    const { loading, handleRegister } = useAuth();
    const navigate = useNavigate();

    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async(e) => {
        e.preventDefault();
        // Registration logic here
        await handleRegister({ username, email, password });
        navigate("/home");
    };

    return (
        <main className="register-page">
            <div className="background-visuals">
                <div className="blob"></div>
                <div className="blob"></div>
            </div>

            <div className="form-container">
                <div className="brand-header">
                    <span className="logo-icon">✨</span>
                    <h1>Join Moodify</h1>
                    <p>Unlock music that understands you.</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <FormGroup
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        label="Name"
                        placeholder="Enter your name"
                    />
                    <FormGroup
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        label="Email"
                        placeholder="Enter your email"
                    />
                    <FormGroup
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        label="Password"
                        placeholder="Enter your password"
                        type="password"
                    />
                    <button className="button" type="submit">Register</button>
                </form>

                <p className="footer-text">
                    Already have an account? <Link to="/login">Login here</Link>
                </p>
            </div>
        </main>
    );
};

export default Register;