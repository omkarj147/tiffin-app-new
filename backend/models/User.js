const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true,
        trim: true
    },
    userType: {
        type: String,
        required: true,
        enum: ['member', 'admin']
    },
    walletBalance: {
        type: Number,
        default: 0,
        min: 0
    },
    status: {
        type: String,
        required: true,
        enum: ['active', 'suspended'],
        default: 'active'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('User', userSchema);
