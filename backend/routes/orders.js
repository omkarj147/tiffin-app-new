const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Order = require('../models/Order');

// Create new order
router.post('/', auth, async (req, res) => {
    try {
        const { items, totalAmount, mealType, foodType, portionSize } = req.body;
        
        if (!items || items.length === 0) {
            return res.status(400).json({ message: 'Order must contain items' });
        }

        // Validate required fields
        if (!mealType || !foodType || !portionSize) {
            return res.status(400).json({ 
                message: 'mealType, foodType, and portionSize are required' 
            });
        }

        // Convert to uppercase for validation
        const upperMealType = mealType.toUpperCase();
        const upperFoodType = foodType.toUpperCase();
        const upperPortionSize = portionSize.toUpperCase();

        // Validate enum values
        if (!['LUNCH', 'DINNER'].includes(upperMealType)) {
            return res.status(400).json({ message: 'Invalid meal type. Must be Lunch or Dinner' });
        }
        if (!['VEG', 'NON-VEG'].includes(upperFoodType)) {
            return res.status(400).json({ message: 'Invalid food type. Must be Veg or Non-veg' });
        }
        if (!['HALF', 'FULL'].includes(upperPortionSize)) {
            return res.status(400).json({ message: 'Invalid portion size. Must be Half or Full' });
        }

        const newOrder = new Order({
            userId: req.user.id,
            items: items.map(item => ({
                menuItemId: item.menuItemId,
                quantity: item.quantity
            })),
            totalAmount,
            mealType: upperMealType,
            foodType: upperFoodType,
            portionSize: upperPortionSize,
            status: 'pending',
            paymentStatus: 'pending'
        });

        const savedOrder = await newOrder.save();
        const populatedOrder = await Order.findById(savedOrder._id)
            .populate('userId', 'name email')
            .populate('items.menuItemId', 'dishName price');

        res.status(201).json(populatedOrder);
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ message: 'Error creating order', error: error.message });
    }
});

// Test route to verify router is working
router.get('/test', (req, res) => {
    res.json({ message: 'Orders router is working' });
});

// Get orders for the logged-in user
router.get('/my-orders', auth, async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.user.id })
            .populate('items.menuItemId', 'dishName price')
            .sort({ createdAt: -1 });

        if (!orders) {
            return res.status(404).json({ message: 'No orders found for this user' });
        }

        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching orders', error: error.message });
    }
});

// Get all orders (Admin only)
router.get('/', auth, async (req, res) => {
    try {
        if (req.user.userType !== 'admin') {
            return res.status(403).json({ message: 'Access denied. Admin only.' });
        }

        console.log('Fetching orders...');
        const orders = await Order.find()
            .populate('userId', 'name email phone')
            .populate('items.menuItemId', 'dishName price')
            .select('_id items totalAmount mealType foodType portionSize status paymentStatus createdAt deliveryAddress specialInstructions userId')
            .sort({ createdAt: -1 });

        console.log('Orders found:', orders.length);
        res.json(orders);
    } catch (error) {
        console.error('Error in GET /orders:', error);
        res.status(500).json({ message: 'Error fetching orders', error: error.message });
    }
});

// Update order status (Admin only)
router.put('/:id/status', auth, async (req, res) => {
    try {
        if (req.user.userType !== 'admin') {
            return res.status(403).json({ message: 'Access denied. Admin only.' });
        }

        const { status } = req.body;
        if (!['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status value' });
        }

        const order = await Order.findByIdAndUpdate(
            req.params.id,
            { $set: { status } },
            { new: true }
        )
        .populate('userId', 'name email')
        .populate('items.menuItemId', 'name price');

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        res.json(order);
    } catch (error) {
        res.status(400).json({ message: 'Error updating order status', error: error.message });
    }
});

// Update payment status (Admin only)
router.put('/:id/payment', auth, async (req, res) => {
    try {
        if (req.user.userType !== 'admin') {
            return res.status(403).json({ message: 'Access denied. Admin only.' });
        }

        const { paymentStatus } = req.body;
        if (!['pending', 'completed', 'failed'].includes(paymentStatus)) {
            return res.status(400).json({ message: 'Invalid payment status value' });
        }

        const order = await Order.findByIdAndUpdate(
            req.params.id,
            { $set: { paymentStatus } },
            { new: true }
        )
        .populate('userId', 'name email')
        .populate('items.menuItemId', 'name price');

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        res.json(order);
    } catch (error) {
        res.status(400).json({ message: 'Error updating payment status', error: error.message });
    }
});

// Cancel order
router.put('/:id/cancel', auth, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Check if the order belongs to the current user
        if (order.userId.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to cancel this order' });
        }

        // Check if order can be cancelled
        if (order.status === 'delivered' || order.status === 'cancelled') {
            return res.status(400).json({ 
                message: `Order cannot be cancelled as it is already ${order.status}` 
            });
        }

        // Update order status to cancelled
        order.status = 'cancelled';
        await order.save();

        res.json({ message: 'Order cancelled successfully', order });
    } catch (error) {
        console.error('Error cancelling order:', error);
        res.status(500).json({ message: 'Server error while cancelling order' });
    }
});

// Delete order (Admin only)
router.delete('/:id', auth, async (req, res) => {
    try {
        if (req.user.userType !== 'admin') {
            return res.status(403).json({ message: 'Access denied. Admin only.' });
        }

        const order = await Order.findByIdAndDelete(req.params.id);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        res.json({ message: 'Order deleted successfully' });
    } catch (error) {
        res.status(400).json({ message: 'Error deleting order', error: error.message });
    }
});

module.exports = router;
