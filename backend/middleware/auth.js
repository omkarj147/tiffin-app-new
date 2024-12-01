const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
    try {
        if (!req.header('Authorization')) {
            throw new Error('No Authorization header');
        }

        const token = req.header('Authorization').replace('Bearer ', '');
        if (!token) {
            throw new Error('No token provided');
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded.userId) {
            throw new Error('Invalid token structure');
        }

        const user = await User.findById(decoded.userId);
        if (!user) {
            throw new Error('User not found');
        }

        req.token = token;
        req.user = {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            userType: user.userType
        };
        next();
    } catch (error) {
        console.error('Auth Error:', error.message);
        res.status(401).json({ 
            error: 'Authentication failed',
            details: error.message 
        });
    }
};

module.exports = auth;
