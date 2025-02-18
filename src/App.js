// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import Login from './components/Login';
import Register from './components/Register';
import GameList from './components/GameList';
import GameDetails from './components/GameDetails'; // For adding/editing games
import GamePage from './components/GamePage'; // For viewing game details
import Navbar from './components/Navbar';
import { AuthProvider } from './context/AuthContext';

function App() {
    return (
        <AuthProvider>
            <Router>
                <Navbar />
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/games" element={<GameList />} />
                    <Route path="/games/add" element={<GameDetails />} /> {/* Add new game */}
                    <Route path="/games/edit/:id" element={<GameDetails />} /> {/* Edit existing game */}
                    <Route path="/games/:id" element={<GamePage />} /> {/* View game details */}
                    <Route path="/games/filter" element={<GameList />} /> {/* Placeholder for filtering */}
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;