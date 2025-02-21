import React, { useEffect, useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/game-list.css';
import { AuthContext } from '../context/AuthContext';

const GameList = () => {
    const [games, setGames] = useState([]);
    const [filteredGames, setFilteredGames] = useState([]); // For filtered games
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [errorMessage, setErrorMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sortBy, setSortBy] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState(''); // For search input

    const sortOptions = [
        { value: '', label: 'None' },
        { value: 'newest', label: 'Newest' },
        { value: 'oldest', label: 'Oldest' },
        { value: 'highestRating', label: 'Highest Rating' },
    ];

    const selectedLabel = sortOptions.find(opt => opt.value === sortBy)?.label || 'None';

    useEffect(() => {
        const fetchGames = async () => {
            try {
                const response = await axios.get('http://localhost:8080/api/games', {
                    params: { sortBy }
                });
                const gamesData = await Promise.all(response.data.map(async (game) => {
                    try {
                        const reviewResponse = await axios.get(`http://localhost:8080/api/reviews/by-game/${game.id}`);
                        const reviews = reviewResponse.data || [];
                        const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
                        const averageRating = reviews.length > 0 ? (totalRating / reviews.length).toFixed(1) : 0;
                        return {
                            ...game,
                            reviews,
                            averageRating: parseFloat(averageRating),
                            releaseDate: game.releaseDate ? new Date(game.releaseDate) : null
                        };
                    } catch (reviewError) {
                        console.error(`Error fetching reviews for game ${game.id}:`, reviewError);
                        return { ...game, reviews: [], averageRating: 0, releaseDate: null };
                    }
                }));
                setGames(gamesData);
                setFilteredGames(gamesData); // Initialize filteredGames with all games
            } catch (error) {
                console.error('Error fetching games:', error);
                setErrorMessage("Failed to fetch games.");
            } finally {
                setLoading(false);
            }
        };
        fetchGames();
    }, [sortBy]);

    // Handle search input change
    const handleSearch = (e) => {
        const query = e.target.value.toLowerCase();
        setSearchQuery(query);

        // Filter games based on the search query
        const filtered = games.filter((game) =>
            game.title.toLowerCase().includes(query)
        );
        setFilteredGames(filtered);
    };

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
        <div className="game-list-container">
            {errorMessage && (
                <div className="error-message">{errorMessage}</div>
            )}
            <h2>Games</h2>

            {/* Search Input */}
            <div className="search-container">
                <input
                    type="text"
                    placeholder="Search games by title..."
                    value={searchQuery}
                    onChange={handleSearch}
                    className="search-input"
                />
            </div>

            {/* Custom Dropdown */}
            <div className="custom-dropdown">
                <input 
                    type="checkbox" 
                    id="sort-dropdown" 
                    checked={isDropdownOpen}
                    onChange={(e) => setIsDropdownOpen(e.target.checked)}
                />
                <label className="dropdown-toggle" htmlFor="sort-dropdown">
                    Sort by: {selectedLabel} <span className="arrow"></span>
                </label>
                <div className="dropdown-menu">
                    {sortOptions.map(option => (
                        <div
                            key={option.value}
                            className="menu-item"
                            onClick={() => {
                                setSortBy(option.value);
                                setIsDropdownOpen(false);
                            }}
                        >
                            {option.label}
                            <span className="menu-arrow"></span>
                        </div>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="loading-message">Loading games...</div>
            ) : (
                <>
                    {user?.roles?.includes('ROLE_ADMIN') && (
                        <div className="add-game-button-container">
                            <Link to="/add-game" className="button-link fancy green">
                                Add New Game
                            </Link>
                        </div>
                    )}
                    <div className="game-grid">
                        {filteredGames.map((game) => (
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
                                        <Link to={`/edit-game/${game.id}`} className="edit-button fancy blue">
                                            Edit Game
                                        </Link>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </>
            )}

            <button className="go-back-button" onClick={() => navigate(-1)}>
                Go Back
            </button>
        </div>
    );
};

export default GameList;