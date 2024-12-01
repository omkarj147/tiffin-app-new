const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const WalletTransaction = require('../models/WalletTransaction');

// Test route to verify wallet router is working
router.get('/test', (req, res) => {
  res.json({ message: 'Wallet router is working' });
});

// Get wallet balance
router.get('/balance', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ balance: user.walletBalance || 0 });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get transaction history
router.get('/transactions', auth, async (req, res) => {
  try {
    const transactions = await WalletTransaction.find({ userId: req.user.id })
      .sort({ createdAt: -1 });
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Add funds to wallet
router.post('/add-funds', auth, async (req, res) => {
  try {
    console.log('Adding funds for user:', req.user.id, 'Amount:', req.body.amount);
    const { amount } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid amount' });
    }

    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const newBalance = (user.walletBalance || 0) + parseFloat(amount);

    // Create transaction record
    await WalletTransaction.create({
      userId: req.user.id,
      type: 'credit',
      amount: parseFloat(amount),
      description: 'Added funds to wallet',
      balance: newBalance
    });

    // Update user's wallet balance
    user.walletBalance = newBalance;
    await user.save();

    console.log('Funds added successfully. New balance:', newBalance);
    res.json({ 
      message: 'Funds added successfully',
      balance: newBalance 
    });
  } catch (err) {
    console.error('Error in /add-funds route:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Deduct from wallet (for internal use)
router.post('/deduct', auth, async (req, res) => {
  try {
    const { amount, description } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid amount' });
    }

    const user = await User.findById(req.user.id);
    
    if (!user.walletBalance || user.walletBalance < amount) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }

    const newBalance = user.walletBalance - amount;

    // Create transaction record
    await WalletTransaction.create({
      userId: req.user.id,
      type: 'debit',
      amount: amount,
      description: description || 'Deducted from wallet',
      balance: newBalance
    });

    // Update user's wallet balance
    user.walletBalance = newBalance;
    await user.save();

    res.json({ 
      message: 'Amount deducted successfully',
      balance: newBalance 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Refund route for admin order cancellation
router.post('/refund', auth, async (req, res) => {
  try {
    const { userId, amount, orderId } = req.body;
    
    // Only allow admins to process refunds
    if (req.user.userType !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to process refunds' });
    }

    // Find user's wallet
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Add refund amount to wallet
    const newBalance = (user.walletBalance || 0) + amount;
    
    // Create transaction record
    await WalletTransaction.create({
      userId: userId,
      type: 'credit',
      amount: amount,
      description: `Refund for cancelled order #${orderId}`,
      balance: newBalance
    });

    // Update user's wallet balance
    user.walletBalance = newBalance;
    await user.save();

    res.json({ 
      message: 'Refund processed successfully',
      balance: newBalance 
    });
  } catch (error) {
    console.error('Error processing refund:', error);
    res.status(500).json({ message: 'Error processing refund' });
  }
});

// Make sure router is exported
module.exports = router;
