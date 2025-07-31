
import User from '../models/userModel.js';
import jwt from 'jsonwebtoken';

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

export const registerUser = async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: 'Please provide username and password' });
    }
    
    try {
        const userExists = await User.findOne({ username });

        if (userExists) {
            return res.status(400).json({ message: 'Username already taken' });
        }

        const user = await User.create({ username, password });
        res.status(201).json({
            _id: user._id,
            username: user.username,
            stats: user.stats,
            history: user.history,
            token: generateToken(user._id),
        });
    } catch (error) {
        console.error('Registration Error:', error);
        res.status(500).json({ message: 'Server error during registration' });
    }
};

export const loginUser = async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username });

        if (user && (await user.matchPassword(password))) {
            res.json({
                _id: user._id,
                username: user.username,
                stats: user.stats,
                history: user.history,
                token: generateToken(user._id),
            });
        } else {
            res.status(401).json({ message: 'Invalid username or password' });
        }
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ message: 'Server error during login' });
    }
};

export const getUserProfile = async (req, res) => {
    res.json({
        _id: req.user._id,
        username: req.user.username,
        stats: req.user.stats,
        history: req.user.history,
    });
};
