// src/App.js

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import GameList from './components/GameList';
import GamePage from './components/GamePage';
import GameDetails from './components/GameDetails'; // Import GameDetails
import Login from './components/Login';
import Register from './components/Register';
import NotFound from './components/NotFound'; // Optional: Add a 404 page
import Navbar from './components/Navbar'; // Import Navbar
import { AuthProvider } from './context/AuthContext'; // Named import

function App() {
    return (
        <AuthProvider> {/* Wrap the entire app with AuthProvider */}
            <Router>
                <Navbar /> {/* Add Navbar here to ensure it appears on all pages */}
                <div className="app-container"> {/* Main content container */}
                    <Routes>
                        {/* Home Page */}
                        <Route path="/" element={<Home />} />

                        {/* Game List Page */}
                        <Route path="/games" element={<GameList />} />

                        {/* Game Details Page (for viewing) */}
                        <Route path="/games/:id" element={<GamePage />} />

                        {/* Add New Game Page */}
                        <Route path="/add-game" element={<GameDetails />} /> {/* Add this route */}

                        {/* Edit Game Page */}
                        <Route path="/edit-game/:id" element={<GameDetails />} /> {/* Ensure this route exists */}

                        {/* Login Page */}
                        <Route path="/login" element={<Login />} />

                        {/* Register Page */}
                        <Route path="/register" element={<Register />} />

                        {/* Optional: 404 Page */}
                        <Route path="*" element={<NotFound />} />
                    </Routes>
                </div>
            </Router>
        </AuthProvider>
    );
}

export default App;