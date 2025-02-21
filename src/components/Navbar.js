// src/components/Navbar.js

import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { FaSignInAlt, FaUserPlus, FaSignOutAlt, FaPlus, FaGamepad } from 'react-icons/fa';
import logo from '../assets/logo.png';
import '../styles/navbar.css';

const Navbar = () => {
    const { user, handleLogout, hasRole } = useContext(AuthContext);
    const navigate = useNavigate();

    const logout = () => {
        handleLogout();
        navigate('/login');
    };

    return (
        <div className="navbar">
            <div className="navbar-logo">
                <Link to="/" className="logo-link">
                    <img src={logo} alt="Game Vault Logo" />
                </Link>
            </div>

            <div className="navbar-links">
                {!user ? (
                    <>
                        <Link to="/login" className="navbar-link fancy">
                            <FaSignInAlt className="icon" />
                            <span>Login</span>
                        </Link>
                        <Link to="/register" className="navbar-link fancy">
                            <FaUserPlus className="icon" />
                            <span>Register</span>
                        </Link>
                    </>
                ) : (
                    <>
                        <Link to="/games" className="navbar-link fancy">
                            <FaGamepad className="icon" />
                            <span>Games</span>
                        </Link>
                        {hasRole('ROLE_ADMIN') && (
                            <Link to="/add-game" className="navbar-link fancy">
                                <FaPlus className="icon" />
                                <span>Add New Game</span>
                            </Link>
                        )}
                        <button onClick={logout} className="logout-button fancy">
                            <FaSignOutAlt className="icon" />
                            <span>Logout</span>
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default Navbar;