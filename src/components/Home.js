// src/components/Home.js
import React, { useEffect, useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { FaSignInAlt, FaUserPlus } from 'react-icons/fa';
import '../styles/home.css';

const Home = () => {
    const { user } = useContext(AuthContext);
    const [featuredGames, setFeaturedGames] = useState([]);
    const [latestGames, setLatestGames] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchFeaturedGames = async () => {
            try {
                const response = await axios.get('http://localhost:8080/api/games/featured');
                const gamesData = await Promise.all(response.data.map(async (game) => {
                    try {
                        const reviewResponse = await axios.get(`http://localhost:8080/api/reviews/by-game/${game.id}`);
                        const reviews = reviewResponse.data || [];
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
                setFeaturedGames(gamesData);
            } catch (error) {
                console.error('Error fetching featured games:', error);
            }
        };

        const fetchLatestGames = async () => {
            try {
                const response = await axios.get('http://localhost:8080/api/games/latest');
                const gamesData = await Promise.all(response.data.map(async (game) => {
                    try {
                        const reviewResponse = await axios.get(`http://localhost:8080/api/reviews/by-game/${game.id}`);
                        const reviews = reviewResponse.data || [];
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
                setLatestGames(gamesData);
            } catch (error) {
                console.error('Error fetching latest games:', error);
            }
        };

        const fetchData = async () => {
            await fetchFeaturedGames();
            await fetchLatestGames();
            setLoading(false);
        };

        fetchData();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    const renderStars = (rating) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating - fullStars >= 0.5;

        for (let i = 0; i < fullStars; i++) {
            stars.push(<span key={i}>★</span>);
        }

        if (hasHalfStar) {
            stars.push(<span key="half">☆</span>);
        }

        while (stars.length < 5) {
            stars.push(<span key={`empty-${stars.length}`} className="empty-star">☆</span>);
        }

        return stars;
    };

    return (
        <div className="home-container">
            <h1 className="metal">Welcome to Game Vault</h1>
            <p>Explore the latest games and read user reviews.</p>

            <div className="buttons">
                <Link to="/games" className="button-85">Explore All Games</Link>
            </div>

            {!user && (
                <div className="buttons">
                    <Link to="/login" className="button-link blue">
                        <FaSignInAlt className="home-icon" />
                        <span>Login</span>
                    </Link>
                    <Link to="/register" className="button-link blue">
                        <FaUserPlus className="home-icon" />
                        <span>Register</span>
                    </Link>
                </div>
            )}

            <div className="featured-games-section">
                <h2 style={{ color: '#C5E0DC', '--a': '45deg', '--t': '.15em' }}>
                    <span>Featured Games</span>
                </h2>
                <div className="game-grid">
                    {featuredGames.map((game) => (
                        <div key={game.id} className="game-card">
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
                            {user?.roles?.includes('ROLE_ADMIN') && (
                                <div className="edit-button-container">
                                    <button className="button-link blue" onClick={() => navigate(`/edit-game/${game.id}`)}>
                                        Edit Game
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <div className="latest-games-section">
                <h2 style={{ color: '#C5E0DC', '--a': '45deg', '--t': '.15em' }}>
                    <span>Latest Games</span>
                </h2>
                <div className="game-grid">
                    {latestGames.map((game) => (
                        <div key={game.id} className="game-card">
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
                            {user?.roles?.includes('ROLE_ADMIN') && (
                                <div className="edit-button-container">
                                    <button className="button-link blue" onClick={() => navigate(`/edit-game/${game.id}`)}>
                                        Edit Game
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Home;