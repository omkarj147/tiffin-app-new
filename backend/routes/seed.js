const express = require('express');
const router = express.Router();
const Menu = require('../models/Menu');
const auth = require('../middleware/auth');

// Seed menu items
router.post('/menu', auth, async (req, res) => {
    try {
        // First, clear existing menu items
        await Menu.deleteMany({});

        // Sample menu items
        const menuItems = [
            {
                dishName: 'Veg Thali',
                price: 150,
                mealType: 'Lunch',
                foodType: 'Veg',
                portionSize: 'Full'
            },
            {
                dishName: 'Chicken Thali',
                price: 180,
                mealType: 'Lunch',
                foodType: 'Non-Veg',
                portionSize: 'Full'
            },
            {
                dishName: 'Mini Veg Thali',
                price: 100,
                mealType: 'Dinner',
                foodType: 'Veg',
                portionSize: 'Half'
            },
            {
                dishName: 'Special Thali',
                price: 200,
                mealType: 'Dinner',
                foodType: 'Veg',
                portionSize: 'Full'
            }
        ];

        // Insert menu items
        const result = await Menu.insertMany(menuItems);
        console.log('Seeded menu items:', result);
        
        res.status(201).json({
            message: 'Menu items seeded successfully',
            items: result
        });
    } catch (error) {
        console.error('Error seeding menu items:', error);
        res.status(500).json({ message: 'Error seeding menu items' });
    }
});

module.exports = router;
