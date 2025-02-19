import React, { useEffect, useState, useCallback, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import '../styles/game-page.css'; // Import game-page.css
import { AuthContext } from '../context/AuthContext'; // Import AuthContext
import NotFound from './NotFound'; // Import the NotFound component

const GamePage = () => {
    const { id } = useParams();
    const [game, setGame] = useState(null); // Initialize as null
    const [reviews, setReviews] = useState([]); // State for reviews
    const [newReview, setNewReview] = useState(''); // State for new review text
    const [newRating, setNewRating] = useState(1); // State for new review rating
    const [isAdmin, setIsAdmin] = useState(false); // State for admin role
    const [loading, setLoading] = useState(true); // Add loading state
    const { user, loading: authLoading } = useContext(AuthContext); // Include user context
    const navigate = useNavigate();

    // Get user info and token from localStorage
    const getUserToken = () => {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        return storedUser ? storedUser.token : null; // Retrieve token from the user object
    };

    // Submit a new review
    const submitReview = async () => {
        try {
            const token = getUserToken();
            if (!token) {
                alert('Please log in to leave a review.');
                navigate('/login');
                return;
            }
            if (!user || !user.id) {
                alert('User not found. Please log in again.');
                navigate('/login');
                return;
            }
            const reviewData = {
                gameId: id,
                userId: user.id, // Use user.id from AuthContext
                comment: newReview,
                rating: newRating
            };
            await axios.post('http://localhost:8080/api/reviews', reviewData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('Review submitted successfully!');
            setNewReview(''); // Clear the review input
            setNewRating(1); // Reset the rating to default
            await fetchReviews(); // Refresh reviews
        } catch (error) {
            console.error('Error submitting review:', error);
            alert('Error submitting review. Please try again.');
        }
    };

    // Fetch game details
    const fetchGame = useCallback(async () => {
        try {
            const response = await axios.get(`http://localhost:8080/api/games/${id}`);
            const gameData = response.data;
            if (!gameData) {
                // If no game data is returned, navigate to NotFound
                navigate('/notfound');
                return;
            }
            setGame({
                ...gameData,
                releaseDate: gameData.releaseDate ? new Date(gameData.releaseDate) : null
            });
        } catch (error) {
            console.error('Error fetching game:', error);
            // If the game is not found (404), navigate to NotFound
            if (error.response && error.response.status === 404) {
                navigate('/notfound');
            } else {
                alert("Failed to fetch game details.");
            }
        }
    }, [id, navigate]);

    // Fetch reviews for the specific game
    const fetchReviews = useCallback(async () => {
        try {
            const token = getUserToken();
            const headers = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
            const response = await axios.get(`http://localhost:8080/api/reviews/by-game/${id}`, headers);
            setReviews(response.data);
        } catch (error) {
            console.error('Error fetching reviews:', error);
            alert("Failed to fetch reviews.");
        }
    }, [id]);

    // Check if the user has admin privileges
    useEffect(() => {
        if (user && user.roles && user.roles.includes('ROLE_ADMIN')) {
            setIsAdmin(true);
        }
    }, [user]);

    // Fetch data on component mount
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            await fetchGame();
            await fetchReviews();
            setLoading(false);
        };
        if (id && !authLoading) fetchData();
    }, [fetchGame, fetchReviews, id, authLoading]);

    // Delete a review
    const deleteReview = async (reviewId) => {
        if (!window.confirm("Are you sure you want to delete this review?")) {
            return; // Cancel deletion if user cancels the confirmation
        }
        try {
            const token = getUserToken();
            if (!token) {
                alert('Please log in to delete a review.');
                navigate('/login');
                return;
            }
            await axios.delete(`http://localhost:8080/api/reviews/${reviewId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('Review deleted successfully!');
            await fetchReviews(); // Refresh reviews
        } catch (error) {
            if (error.response && error.response.status === 403) {
                alert('You do not have permission to delete this review.');
            } else {
                console.error('Error deleting review:', error);
                alert('Error deleting review. Please try again.');
            }
        }
    };

    // Calculate average game rating
    const calculateAverageRating = () => {
        if (reviews.length === 0) return 0;
        const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
        return (totalRating / reviews.length).toFixed(1);
    };

    // Render star rating
    const renderStars = (rating, active = false) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating - fullStars >= 0.5;

        for (let i = 0; i < fullStars; i++) {
            stars.push(<span key={i} className={active ? 'active' : ''}>★</span>); // Full star
        }

        if (hasHalfStar) {
            stars.push(<span key="half">☆</span>); // Half star
        }

        while (stars.length < 5) {
            stars.push(<span key={`empty-${stars.length}`} className="empty-star">☆</span>); // Empty star
        }

        return stars;
    };

    // Handle rating star click
    const handleRatingClick = (index) => {
        setNewRating(index + 1);
    };

    // Render loading state
    if (loading || authLoading) {
        return <div>Loading...</div>;
    }

    // If the game doesn't exist, render the NotFound component
    if (!game) {
        return <NotFound />;
    }

    return (
        <div className="game-page-container">
            {/* Display the game title */}
            <h2>{game.title}</h2>

            {/* Display the game image */}
            {game.imageUrl && (
                <img src={`http://localhost:8080${game.imageUrl}`} alt={game.title} className="game-image" />
            )}

            {/* Display game details */}
            <div className="game-details-box">
                <p><strong>Description:</strong> {game.description}</p>
                <p><strong>Platform:</strong> {game.platform}</p>
                <p>
                    <strong>Release Date:</strong>{' '}
                    {game.releaseDate ? game.releaseDate.toLocaleDateString() : 'Not Available'}
                </p>
                <p>
                    <strong>Average Rating:</strong>{' '}
                    <span className="star-rating">
                        {renderStars(calculateAverageRating())}
                    </span>
                </p>
            </div>

            {/* Reviews Section */}
            <div className="reviews-section">
                <h3>Reviews</h3>
                {reviews.length > 0 ? (
                    reviews.map((review) => (
                        <div key={review.id} className="review-card">
                            <strong>{review.username || 'Unknown User'}</strong>
                            <p>{review.comment}</p>
                            <p>
                                <strong>Rating:</strong>{' '}
                                <span className="star-rating">
                                    {renderStars(review.rating)}
                                </span>
                            </p>
                            {/* Show delete button for review owner or admin */}
                            {(user && (user.username === review.username || isAdmin)) && (
                                <button
                                    onClick={() => deleteReview(review.id)}
                                    className="delete-review-button"
                                >
                                    Delete Review
                                </button>
                            )}
                        </div>
                    ))
                ) : (
                    <p>No reviews yet.</p>
                )}
            </div>

            {/* Add a new review section */}
            <div className="add-review-section">
                <h3>Add a Review</h3>
                <textarea
                    value={newReview}
                    onChange={(e) => setNewReview(e.target.value)}
                    placeholder="Write your review here..."
                    className="textarea"
                    required
                />
                <div className="rating-stars">
                    {[1, 2, 3, 4, 5].map((rating) => (
                        <span
                            key={rating}
                            onClick={() => handleRatingClick(rating - 1)}
                            className={newRating >= rating ? 'active' : ''}
                        >
                            ★
                        </span>
                    ))}
                </div>
                <button onClick={submitReview}>Submit Review</button>
            </div>

            {/* Admin controls (Edit Game and Go Back buttons) */}
            <div className="admin-controls">
                {isAdmin && (
                    <Link to={`/edit-game/${id}`} className="button blue">Edit Game</Link>
                )}
                <button className="button gray" onClick={() => navigate(-1)}>Go Back</button>
            </div>

            {/* Go Back Button Always Visible */}
            <button className="go-back-button" onClick={() => navigate(-1)}>Go Back</button>
        </div>
    );
};

export default GamePage;