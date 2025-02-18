// src/components/Home.js
import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext'; // Import AuthContext

const Home = () => {
    const { user } = useContext(AuthContext); // Use useContext directly

    return (
        <div className="home-container">
            <h1>Welcome to Game Vault</h1>
            <p>Explore the latest games and read user reviews.</p>

            {!user && (
                <div className="buttons">
                    <Link to="/login" className="button-link green">Login</Link>
                    <Link to="/register" className="button-link blue">Register</Link>
                </div>
            )}

            {user && (
                <div className="buttons">
                    <Link to="/games" className="button-link green">Show All Games</Link>
                    {user?.roles?.includes('ROLE_ADMIN') && (
                        <Link to="/games/filter" className="button-link blue">Filter Games</Link>
                    )}
                </div>
            )}
        </div>
    );
};

export default Home;