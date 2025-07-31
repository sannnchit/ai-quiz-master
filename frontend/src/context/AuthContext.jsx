import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const userInfo = localStorage.getItem('quiz_user_info');
        if (userInfo) {
            const parsedInfo = JSON.parse(userInfo);
            setUser(parsedInfo);
            api.defaults.headers.common['Authorization'] = `Bearer ${parsedInfo.token}`;
        }
    }, []);

    const login = (userData) => {
        localStorage.setItem('quiz_user_info', JSON.stringify(userData));
        api.defaults.headers.common['Authorization'] = `Bearer ${userData.token}`;
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem('quiz_user_info');
        delete api.defaults.headers.common['Authorization'];
        setUser(null);
    };

    const updateUser = (updatedDataFromServer) => {
        // Use the function form of setUser to prevent race conditions and ensure we have the latest state.
        setUser(currentUser => {
            // Create the new user object, explicitly preserving the token from the existing session.
            const newUserData = {
                ...currentUser, // This preserves the token and other details like _id, username
                stats: updatedDataFromServer.stats, // Overwrite with fresh stats from server
                history: updatedDataFromServer.history, // Overwrite with fresh history from server
            };
            // Update localStorage with the new, complete user data.
            localStorage.setItem('quiz_user_info', JSON.stringify(newUserData));
            return newUserData;
        });
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
};
