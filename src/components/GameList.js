// src/components/GameList.js
import React, { useEffect, useState, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom'; // Import Link
import axios from 'axios';
import '../styles/game-list.css'; // Import game-list.css
import { AuthContext } from '../context/AuthContext'; // Import AuthContext

const GameList = () => {
    const [games, setGames] = useState([]);
    const { user } = useContext(AuthContext); // Use AuthContext directly
    const location = useLocation(); // Get location state
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        if (location.state?.errorMessage) {
            // Display error message if passed via state
            setErrorMessage(location.state.errorMessage);
            setTimeout(() => {
                setErrorMessage(''); // Clear the error message after 3 seconds
            }, 3000);
        }
    }, [location]);

    useEffect(() => {
        const fetchGames = async () => {
            try {
                const response = await axios.get('http://localhost:8080/api/games');
                const gamesData = response.data.map((g) => ({
                    ...g,
                    releaseDate: g.releaseDate ? new Date(g.releaseDate) : null // Convert releaseDate to Date object
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
                <Link to="/games/add" className="button-link fancy">
                    Add New Game
                </Link>
            )}

            <div className="game-grid">
                {games.map((game) => (
                    <Link key={game.id} to={`/games/${game.id}`} className="game-card"> {/* Make the card clickable */}
                        {/* Display the game image */}
                        {game.imageUrl && (
                            <img
                                src={`http://localhost:8080${game.imageUrl}`}
                                alt={game.title}
                                className="game-image" // Ensure images are styled consistently
                            />
                        )}

                        {/* Display game details */}
                        <div className="game-card-content">
                            <h3>{game.title}</h3>
                            <p>{game.description}</p>
                            <strong>Platform: {game.platform}</strong>
                            <p>
                                Release Date:{" "}
                                {game.releaseDate ? game.releaseDate.toLocaleDateString() : 'Not Available'}
                            </p>
                        </div>

                        {/* Fixed-height container for the Edit Game button */}
                        {user?.roles?.includes('ROLE_ADMIN') && (
                            <div className="edit-button-container">
                                <Link to={`/games/edit/${game.id}`} className="edit-button fancy">
                                    Edit Game
                                </Link>
                            </div>
                        )}
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default GameList;