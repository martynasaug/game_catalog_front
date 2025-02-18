// src/context/AuthContext.js

import React, { createContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null); // State for user (includes token)
    const [loading, setLoading] = useState(true);

    // Function to handle login
    const login = (token) => {
        if (!token) return;

        try {
            const decodedToken = jwtDecode(token);

            // Validate token expiration
            if (decodedToken.exp * 1000 > Date.now()) {
                const storedUser = JSON.parse(localStorage.getItem('user')) || {};
                setUser({
                    ...decodedToken,
                    id: storedUser.id || decodedToken.id, // Use stored ID or fallback to decoded ID
                    username: decodedToken.sub, // Extract username from token
                    roles: decodedToken.roles || [], // Extract roles from token
                    token: token // Include the token in the user state
                });

                // Save user details including the token in localStorage
                localStorage.setItem('user', JSON.stringify({
                    id: storedUser.id || decodedToken.id,
                    username: decodedToken.sub,
                    roles: decodedToken.roles || [],
                    token: token // Include the token here
                }));
            } else {
                console.error('Token expired');
                handleLogout(); // Clear user data if the token is expired
            }
        } catch (error) {
            console.error('Invalid token:', error);
            handleLogout(); // Clear user data if the token is invalid
        } finally {
            setLoading(false); // Ensure loading is set to false after processing
        }
    };

    // Function to handle logout
    const handleLogout = () => {
        localStorage.removeItem('user'); // Clear user data including token
        setUser(null); // Reset user state
    };

    // Function to check if the user has a specific role
    const hasRole = (role) => {
        return user?.roles?.includes(role) || false;
    };

    // Fetch user data from token on component mount
    useEffect(() => {
        const fetchUserFromToken = async () => {
            try {
                const storedUser = JSON.parse(localStorage.getItem('user'));
                if (storedUser && storedUser.token) {
                    const decodedToken = jwtDecode(storedUser.token);

                    // Validate token expiration
                    if (decodedToken.exp * 1000 > Date.now()) {
                        setUser({
                            ...decodedToken,
                            id: storedUser.id || decodedToken.id, // Use stored ID or fallback to decoded ID
                            username: decodedToken.sub, // Extract username from token
                            roles: decodedToken.roles || [], // Extract roles from token
                            token: storedUser.token // Include the token here
                        });
                    } else {
                        console.error('Token expired');
                        handleLogout(); // Clear user data if the token is expired
                    }
                }
            } catch (error) {
                console.error('Invalid token:', error);
                handleLogout(); // Clear user data if the token is invalid
            } finally {
                setLoading(false); // Ensure loading is set to false after processing
            }
        };

        fetchUserFromToken();
    }, []);

    return (
        <AuthContext.Provider value={{ user, login, handleLogout, loading, hasRole }}>
            {children}
        </AuthContext.Provider>
    );
};