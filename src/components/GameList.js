import React, { useEffect, useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/game-list.css';
import { AuthContext } from '../context/AuthContext';

const GameList = () => {
    const [games, setGames] = useState([]);
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [errorMessage, setErrorMessage] = useState('');
    const [loading, setLoading] = useState(true); // Add loading state

    useEffect(() => {
        const fetchGames = async () => {
            try {
                const response = await axios.get('http://localhost:8080/api/games');
                const gamesData = await Promise.all(response.data.map(async (game) => {
                    try {
                        // Fetch reviews for each game
                        const reviewResponse = await axios.get(`http://localhost:8080/api/reviews/by-game/${game.id}`);
                        const reviews = reviewResponse.data || [];
                        // Calculate average rating
                        const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
                        const averageRating = reviews.length > 0 ? (totalRating / reviews.length).toFixed(1) : 0;
                        return {
                            ...game,
                            reviews,
                            averageRating,
                            releaseDate: game.releaseDate ? new Date(game.releaseDate) : null
                        };
                    } catch (reviewError) {
                        console.error(`Error fetching reviews for game ${game.id}:`, reviewError);
                        return { ...game, reviews: [], averageRating: 0, releaseDate: null };
                    }
                }));
                setGames(gamesData);
            } catch (error) {
                console.error('Error fetching games:', error);
                setErrorMessage("Failed to fetch games.");
            } finally {
                setLoading(false); // Ensure loading is set to false after fetching
            }
        };
        fetchGames();
    }, []);

    // Render loading state
    if (loading) {
        return <div>Loading...</div>;
    }

    // Render star rating
    const renderStars = (rating) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating - fullStars >= 0.5;

        for (let i = 0; i < fullStars; i++) {
            stars.push(<span key={i} className="star">★</span>);
        }

        if (hasHalfStar) {
            stars.push(<span key="half" className="star">☆</span>);
        }

        while (stars.length < 5) {
            stars.push(<span key={`empty-${stars.length}`} className="star empty-star">☆</span>);
        }

        return stars;
    };

    return (
        <div className="game-list-container">
            {/* Display error message if present */}
            {errorMessage && (
                <div className="error-message">{errorMessage}</div>
            )}
            <h2>Games</h2>
            {/* Add "Add New Game" Button for Admins (aligned to left) */}
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
                        {/* Clickable game card (excluding buttons) */}
                        <Link to={`/games/${game.id}`} className="game-card-link">
                            {game.imageUrl && (
                                <img src={`http://localhost:8080${game.imageUrl}`} alt={game.title} className="game-image" />
                            )}
                            <div className="game-card-content">
                                <h3>{game.title}</h3>
                                <p>{game.description}</p>
                                <strong>Platform: {game.platform}</strong>
                                <br />
                                <strong>Release Date: {game.releaseDate ? game.releaseDate.toLocaleDateString() : 'Not Available'}</strong>
                                <br />
                                <strong>Average Rating:</strong>
                                <div className="star-rating">
                                    {renderStars(game.averageRating)}
                                </div>
                            </div>
                        </Link>
                        {/* Separate "Edit Game" button (for admins) */}
                        {user?.roles?.includes('ROLE_ADMIN') && (
                            <div className="edit-button-container">
                                <Link to={`/edit-game/${game.id}`} className="edit-button fancy blue">
                                    Edit Game
                                </Link>
                            </div>
                        )}
                    </div>
                ))}
            </div>
            {/* Go Back Button */}
            <button className="go-back-button" onClick={() => navigate(-1)}>
                Go Back
            </button>
        </div>
    );
};

export default GameList;