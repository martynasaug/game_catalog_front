import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/register.css'; // Import register styles

const Register = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:8080/api/auth/register', {
                username,
                password,
                roles: ['ROLE_USER'],
            });
            alert('Registration successful! Please log in.');
            navigate('/login');
        } catch (error) {
            alert('Error registering user');
            console.error('Register error:', error);
        }
    };

    return (
        <div className="register-container">
            <h2>Register</h2>
            <form className="register-form" onSubmit={handleSubmit}>
                <div className="input-group">
                    <label>Username:</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>
                <div className="input-group">
                    <label>Password:</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button className="register-button" type="submit">Register</button>
            </form>
            <div className="login-link">
                Already have an account?{' '}
                <Link to="/login">Login here</Link>
            </div>
            <button className="go-back-button" onClick={() => navigate(-1)}>
                Go Back
            </button>
        </div>
    );
};

export default Register;