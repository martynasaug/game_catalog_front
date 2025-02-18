// src/components/GameDetails.js
import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/game-details.css';
import { AuthContext } from '../context/AuthContext';

const GameDetails = () => {
    const { id } = useParams();
    const [game, setGame] = useState({
        title: '',
        description: '',
        platform: '',
        releaseDate: '', // Initialize as an empty string
        imageUrl: ''
    });
    const [file, setFile] = useState(null);
    const { user, loading } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        if (loading) return;

        if (!user || !(user?.roles?.includes('ROLE_ADMIN'))) {
            navigate('/games', { state: { errorMessage: 'Access denied. Only admins can add or edit games.' } });
            return;
        }

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

        if (id) fetchGame();
    }, [id, user, loading, navigate]);

    const handleChange = (e) => {
        setGame({ ...game, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!user || !(user?.roles?.includes('ROLE_ADMIN'))) {
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
                await axios.put(`http://localhost:8080/api/games/${id}`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                });
            } else {
                await axios.post('http://localhost:8080/api/games', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }
            navigate('/games');
        } catch (error) {
            console.error('Error submitting game:', error);
            alert('Error submitting game. Please try again.');
        }
    };

    return (
        <div className="game-details-container">
            <h2>{id ? 'Edit Game' : 'Add New Game'}</h2>
            <form onSubmit={handleSubmit}>
                <div className="input-group">
                    <label>Title:</label>
                    <input
                        type="text"
                        name="title"
                        value={game.title}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="input-group">
                    <label>Description:</label>
                    <textarea
                        name="description"
                        value={game.description}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="input-group">
                    <label>Platform:</label>
                    <input
                        type="text"
                        name="platform"
                        value={game.platform}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="input-group">
                    <label>Release Date:</label>
                    <input
                        type="date"
                        name="releaseDate"
                        value={game.releaseDate}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="input-group">
                    <label>Image:</label>
                    <input
                        type="file"
                        onChange={handleFileChange}
                    />
                </div>
                <button type="submit">{id ? 'Update Game' : 'Add Game'}</button>
            </form>
        </div>
    );
};

export default GameDetails;