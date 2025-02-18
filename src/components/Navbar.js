// src/components/Navbar.js

import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import logo from '../assets/logo.png'; // Ensure the logo path is correct
import '../styles/navbar.css'; // Import navbar styles

const Navbar = () => {
    const { user, handleLogout, hasRole } = useContext(AuthContext);
    const navigate = useNavigate();

    const logout = () => {
        handleLogout();
        navigate('/login');
    };

    return (
        <div className="navbar">
            {/* Logo as a plain link */}
            <div className="navbar-logo">
                <Link to="/" className="logo-link">
                    <img src={logo} alt="Game Vault Logo" />
                </Link>
            </div>

            {/* Navigation Links */}
            <div className="navbar-links">
                {!user ? (
                    <>
                        <Link to="/login" className="navbar-link fancy">
                            Login
                        </Link>
                        <Link to="/register" className="navbar-link fancy">
                            Register
                        </Link>
                    </>
                ) : (
                    <>
                        <Link to="/games" className="navbar-link fancy">
                            Games
                        </Link>
                        {hasRole('ROLE_ADMIN') && (
                            <Link to="/add-game" className="navbar-link fancy">
                                Add New Game
                            </Link>
                        )}
                        <button onClick={logout} className="logout-button fancy">
                            Logout
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default Navbar;