import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { CiUser } from 'react-icons/ci';
import { FaEdit, FaSave, FaTimes } from 'react-icons/fa';
import '../styles/profile.css';

const Profile = () => {
    const { userId } = useParams();
    const { user: currentUser } = useContext(AuthContext);
    const [profileUser, setProfileUser] = useState(null);
    const [reviews, setReviews] = useState([]); // Initialize as an empty array
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        bio: ''
    });
    const [profileImage, setProfileImage] = useState(null);
    const [previewImage, setPreviewImage] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError('');
                
                // Fetch user data
                const userResponse = await axios.get(`http://localhost:8080/api/users/${userId}`);
                setProfileUser(userResponse.data);
                setFormData({
                    username: userResponse.data.username,
                    email: userResponse.data.email,
                    bio: userResponse.data.bio || ''
                });
                
                if (userResponse.data.profileImageUrl) {
                    setPreviewImage(`http://localhost:8080${userResponse.data.profileImageUrl}`);
                }

                // Fetch reviews
                const reviewsResponse = await axios.get(`http://localhost:8080/api/users/${userId}/reviews`);
                setReviews(reviewsResponse.data);

            } catch (error) {
                console.error('Error fetching profile data:', error);
                setError('Failed to load profile data');
            } finally {
                setLoading(false);
            }
        };
        
        fetchData();
    }, [userId]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfileImage(file);
            setPreviewImage(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formDataToSend = new FormData();
        formDataToSend.append('username', formData.username);
        formDataToSend.append('email', formData.email);
        formDataToSend.append('bio', formData.bio);
        if (profileImage) {
            formDataToSend.append('file', profileImage);
        }

        try {
            const response = await axios.put(
                `http://localhost:8080/api/users/${userId}`,
                formDataToSend,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );
            setProfileUser(response.data);
            setIsEditing(false);
            if(response.data.profileImageUrl) {
                setPreviewImage(`http://localhost:8080${response.data.profileImageUrl}`);
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            setError('Failed to update profile');
        }
    };

    if (loading) return <div className="loading">Loading...</div>;
    if (error) return <div className="error">{error}</div>;
    if (!profileUser) return <div className="error">User not found</div>;

    return (
        <div className="profile-container">
            <div className="profile-header">
                <div className="profile-image-container">
                    {previewImage ? (
                        <img src={previewImage} alt="Profile" className="profile-image" />
                    ) : (
                        <div className="profile-image-placeholder">
                            <CiUser size={64} />
                        </div>
                    )}
                    {isEditing && (
                        <label className="image-upload-label">
                            <input
                                type="file"
                                onChange={handleImageChange}
                                accept="image/*"
                                className="image-upload-input"
                            />
                            Change Photo
                        </label>
                    )}
                </div>

                <div className="profile-info">
                    {isEditing ? (
                        <form onSubmit={handleSubmit} className="edit-form">
                            <div className="form-group">
                                <label>Username</label>
                                <input
                                    type="text"
                                    value={formData.username}
                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Email</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Bio</label>
                                <textarea
                                    value={formData.bio}
                                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                    rows="4"
                                />
                            </div>
                            <div className="form-actions">
                                <button type="submit" className="btn save-btn">
                                    <FaSave /> Save Changes
                                </button>
                                <button
                                    type="button"
                                    className="btn cancel-btn"
                                    onClick={() => setIsEditing(false)}
                                >
                                    <FaTimes /> Cancel
                                </button>
                            </div>
                        </form>
                    ) : (
                        <>
                            <h2 className="username">{profileUser.username}</h2>
                            <p className="email">{profileUser.email}</p>
                            <p className="bio">{profileUser.bio || 'No bio yet...'}</p>
                            <p className="member-since">
                                Member since: {new Date(profileUser.registrationDate).toLocaleDateString()}
                            </p>
                            {currentUser?.id === profileUser.id && (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="btn edit-btn"
                                >
                                    <FaEdit /> Edit Profile
                                </button>
                            )}
                        </>
                    )}
                </div>
            </div>

            <div className="reviews-section">
                <h3 className="section-title">My Reviews</h3>
                {reviews.length > 0 ? (
                    <div className="reviews-grid">
                        {reviews.map(review => (
                            review?.game && (
                                <div key={review.id} className="review-card">
                                    <Link 
                                        to={`/games/${review.game?.id}`} 
                                        className="game-link"
                                    >
                                        <h4 className="game-title">
                                            {review.game?.title || 'Unknown Game'}
                                        </h4>
                                    </Link>
                                    <div className="rating-stars">
                                        {[...Array(5)].map((_, i) => (
                                            <span
                                                key={i}
                                                className={`star ${i < review.rating ? 'filled' : ''}`}
                                            >
                                                ★
                                            </span>
                                        ))}
                                    </div>
                                    <p className="review-comment">{review.comment}</p>
                                </div>
                            )
                        ))}
                    </div>
                ) : (
                    <p className="no-reviews">No reviews yet.</p>
                )}
            </div>
        </div>
    );
};

export default Profile;