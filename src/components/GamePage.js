// src/components/GamePage.js

import React, { useEffect, useState, useCallback, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import '../styles/game-page.css'; // Import game-page.css
import { AuthContext } from '../context/AuthContext'; // Import AuthContext

const GamePage = () => {
    const { id } = useParams();
    const [game, setGame] = useState({
        title: '',
        description: '',
        platform: '',
        releaseDate: '', // Initialize as an empty string
        imageUrl: ''
    });
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
        console.log("User object from localStorage:", storedUser); // Debugging log
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

            console.log("Submitting review data:", reviewData); // Debugging log
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
            const token = getUserToken();
            const headers = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
            const response = await axios.get(`http://localhost:8080/api/games/${id}`, headers);
            const gameData = response.data;
            setGame({
                ...gameData,
                releaseDate: gameData.releaseDate ? new Date(gameData.releaseDate) : null
            });
        } catch (error) {
            console.error('Error fetching game:', error);
            alert("Failed to fetch game details.");
        }
    }, [id]);

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

    // Render loading state
    if (loading || authLoading) {
        return <div>Loading...</div>;
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
            </div>

            {/* Display existing reviews */}
            <h3>Reviews</h3>
            {reviews.length > 0 ? (
                reviews.map((review) => (
                    <div key={review.id} className="review-card">
                        <strong>User: {review.username || 'Unknown User'} - Rating: {review.rating}/5</strong>
                        <p>{review.comment}</p>
                    </div>
                ))
            ) : (
                <p>No reviews yet.</p>
            )}

            {/* Add a new review section */}
            <h3>Add a Review</h3>
            <textarea
                value={newReview}
                onChange={(e) => setNewReview(e.target.value)}
                placeholder="Write your review here..."
                className="add-review-section textarea"
                required
            />
            <select
                value={newRating}
                onChange={(e) => setNewRating(parseInt(e.target.value))}
                className="add-review-section select"
                required
            >
                {[1, 2, 3, 4, 5].map((rating) => (
                    <option key={rating} value={rating}>
                        {rating}
                    </option>
                ))}
            </select>
            <button onClick={submitReview} className="add-review-section button green">
                Submit Review
            </button>

            {/* Admin controls (Edit Game and Add New Game buttons) */}
            {isAdmin && (
                <div className="admin-controls">
                    <Link to={`/edit-game/${id}`} className="admin-controls button blue">
                        Edit Game
                    </Link>
                    <Link to="/add-game" className="admin-controls button green">
                        Add New Game
                    </Link>
                </div>
            )}
        </div>
    );
};

export default GamePage;