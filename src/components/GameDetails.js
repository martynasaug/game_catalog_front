import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/game-details.css';
import { AuthContext } from '../context/AuthContext';

const GameDetails = () => {
    const { id } = useParams(); // Get the game ID from params
    const [game, setGame] = useState({
        title: '',
        description: '',
        platform: '',
        releaseDate: '', // Initialize as an empty string
        imageUrl: ''
    });
    const [file, setFile] = useState(null); // State for uploaded image file
    const { user, loading } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        if (loading) return;
        if (!user || !user.roles.includes('ROLE_ADMIN')) {
            navigate('/games', { state: { errorMessage: 'Access denied. Only admins can add or edit games.' } });
            return;
        }
        // Fetch existing game data if editing (ID is provided)
        if (id) {
            const fetchGame = async () => {
                try {
                    const response = await axios.get(`http://localhost:8080/api/games/${id}`);
                    const gameData = response.data;
                    setGame({
                        ...gameData,
                        releaseDate: gameData.releaseDate ? new Date(gameData.releaseDate).toISOString().split('T')[0] : ''
                    });
                } catch (error) {
                    console.error('Error fetching game:', error);
                    navigate('/games');
                }
            };
            fetchGame();
        }
    }, [id, user, loading, navigate]);

    const handleChange = (e) => {
        setGame({ ...game, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user || !user.roles.includes('ROLE_ADMIN')) {
            navigate('/games', { state: { errorMessage: 'Access denied. Only admins can add or edit games.' } });
            return;
        }
        const formData = new FormData();
        if (file) formData.append('file', file);
        formData.append('title', game.title);
        formData.append('description', game.description);
        formData.append('platform', game.platform);
        formData.append('releaseDate', game.releaseDate);
        try {
            if (id) {
                // Update existing game
                await axios.put(`http://localhost:8080/api/games/${id}`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                });
            } else {
                // Create new game
                await axios.post('http://localhost:8080/api/games', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }
            navigate('/games'); // Redirect to game list after submission
        } catch (error) {
            console.error('Error submitting game:', error);
            alert('Error submitting game. Please try again.');
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this game?')) {
            return; // Cancel deletion if user cancels the confirmation
        }
        try {
            await axios.delete(`http://localhost:8080/api/games/${id}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            navigate('/games'); // Redirect to game list after deletion
        } catch (error) {
            console.error('Error deleting game:', error);
            alert('Error deleting game. Please try again.');
        }
    };

    const handleCancel = () => {
        navigate('/games'); // Navigate to the games list when cancel is clicked
    };

    return (
        <div className="game-details-container">
            <h2>{id ? 'Edit Game' : 'Add New Game'}</h2>
            <form onSubmit={handleSubmit}>
                <div className="input-group">
                    <label htmlFor="title">Title:</label>
                    <input
                        type="text"
                        id="title"
                        name="title"
                        value={game.title}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="input-group">
                    <label htmlFor="description">Description:</label>
                    <textarea
                        id="description"
                        name="description"
                        value={game.description}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="input-group">
                    <label htmlFor="platform">Platform:</label>
                    <input
                        type="text"
                        id="platform"
                        name="platform"
                        value={game.platform}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="input-group">
                    <label htmlFor="releaseDate">Release Date:</label>
                    <input
                        type="date"
                        id="releaseDate"
                        name="releaseDate"
                        value={game.releaseDate}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="input-group">
                    <label htmlFor="image">Image:</label>
                    <input
                        type="file"
                        id="image"
                        name="file"
                        onChange={handleFileChange}
                    />
                </div>
                <button type="submit" className={`button-link fancy ${id ? 'blue' : 'green'}`}>
                    {id ? 'Update Game' : 'Add Game'}
                </button>
            </form>
            <div className="action-buttons">
                {id && (
                    <button onClick={handleDelete} className="button-link fancy red">
                        Delete Game
                    </button>
                )}
                <button onClick={handleCancel} className="button-link fancy gray">
                    Cancel
                </button>
            </div>
        </div>
    );
};

export default GameDetails;