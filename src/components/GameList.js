// src/components/GameList.js

import React, { useEffect, useState, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import '../styles/game-list.css';
import { AuthContext } from '../context/AuthContext';

const GameList = () => {
    const [games, setGames] = useState([]);
    const { user } = useContext(AuthContext);
    const location = useLocation();
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        if (location.state?.errorMessage) {
            setErrorMessage(location.state.errorMessage);
            setTimeout(() => {
                setErrorMessage('');
            }, 3000);
        }
    }, [location]);

    useEffect(() => {
        const fetchGames = async () => {
            try {
                const response = await axios.get('http://localhost:8080/api/games');
                const gamesData = response.data.map((g) => ({
                    ...g,
                    releaseDate: g.releaseDate ? new Date(g.releaseDate) : null
                }));
                setGames(gamesData);
            } catch (error) {
                console.error('Error fetching games:', error);
            }
        };
        fetchGames();
    }, []);

    return (
        <div className="game-list-container">
            {/* Display error message if present */}
            {errorMessage && (
                <div className="error-message">{errorMessage}</div>
            )}

            <h2>Games</h2>

            {/* Add "Add New Game" Button for Admins */}
            {user?.roles?.includes('ROLE_ADMIN') && (
                <div className="add-game-button-container">
                    <Link to="/add-game" className="button-link fancy green">
                        Add New Game
                    </Link>
                </div>
            )}

            {/* Game Grid */}
            <div className="game-grid">
                {games.map((game) => (
                    <div key={game.id} className="game-card">
                        {/* Make the card clickable */}
                        <Link to={`/games/${game.id}`} className="game-card-link">
                            {/* Display the game image */}
                            {game.imageUrl && (
                                <img src={`http://localhost:8080${game.imageUrl}`} alt={game.title} className="game-image" />
                            )}

                            {/* Display game details */}
                            <div className="game-card-content">
                                <h3>{game.title}</h3>
                                <p>{game.description}</p>
                                <strong>Platform: {game.platform}</strong>
                                <br />
                                <strong>Release Date: {game.releaseDate ? game.releaseDate.toLocaleDateString() : 'Not Available'}</strong>
                            </div>

                            {/* Fixed-height container for the Edit Game button */}
                            {user?.roles?.includes('ROLE_ADMIN') && (
                                <div className="edit-button-container">
                                    <Link to={`/edit-game/${game.id}`} className="edit-button fancy blue">
                                        Edit Game
                                    </Link>
                                </div>
                            )}
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default GameList;