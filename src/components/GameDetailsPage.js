// src/components/GameDetailsPage.js
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/game-page.css'; // Import game-page.css

const GameDetailsPage = () => {
    const { id } = useParams();
    const [game, setGame] = useState({
        title: '',
        description: '',
        platform: '',
        releaseDate: '', // Initialize as an empty string
        imageUrl: ''
    });
    const navigate = useNavigate();

    useEffect(() => {
        const fetchGame = async () => {
            try {
                const response = await axios.get(`http://localhost:8080/api/games/${id}`);
                const gameData = response.data;
                // Convert releaseDate to a Date object only if it exists
                setGame({
                    ...gameData,
                    releaseDate: gameData.releaseDate ? new Date(gameData.releaseDate) : null
                });
            } catch (error) {
                console.error('Error fetching game:', error);
                navigate('/games'); // Redirect to game list if error occurs
            }
        };
        fetchGame();
    }, [id, navigate]);

    return (
        <div className="game-page-container">
            <h2>{game.title}</h2>
            {game.imageUrl && (
                <img
                    src={`http://localhost:8080${game.imageUrl}`}
                    alt={game.title}
                    className="game-image"
                />
            )}
            <p>{game.description}</p>
            <strong>Platform: {game.platform}</strong>
            <strong>
                Release Date:{" "}
                {game.releaseDate ? game.releaseDate.toLocaleDateString() : 'Not Available'}
            </strong>
            <div className="buttons">
                <button onClick={() => navigate('/games')}>Back to Games</button>
            </div>
        </div>
    );
};

export default GameDetailsPage;