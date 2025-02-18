// src/components/Login.js

import React, { useState, useContext } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import '../styles/login.css';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:8080/api/auth/login', {
                username,
                password,
            });

            const { id, username: userUsername, roles, token } = response.data;

            if (token && id) {
                // Store user details including the token in localStorage under the "user" key
                localStorage.setItem('user', JSON.stringify({ id, username: userUsername, roles, token }));

                // Update AuthContext
                login(token);

                navigate('/'); // Redirect to home page
            } else {
                alert('Invalid credentials');
            }
        } catch (error) {
            alert('Error logging in');
            console.error('Login error:', error);
        }
    };

    return (
        <div className="login-container">
            <h2>Login</h2>
            <form onSubmit={handleSubmit}>
                <div className="input-group">
                    <label htmlFor="username">Username:</label>
                    <input
                        type="text"
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>
                <div className="input-group">
                    <label htmlFor="password">Password:</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit" className="blue button-link fancy">
                    Login
                </button>
            </form>
            <p className="register-link">
                Don't have an account?{' '}
                <Link to="/register" className="link">
                    Register here
                </Link>
            </p>
        </div>
    );
};

export default Login;