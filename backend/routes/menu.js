const express = require('express');
const router = express.Router();
const Menu = require('../models/Menu');
const auth = require('../middleware/auth');

// Get all menu items
router.get('/', auth, async (req, res) => {
    try {
        const menuItems = await Menu.find({ isDeleted: false })
            .select('dishName price mealType foodType portionSize'); // Explicitly select the fields we need
        console.log('Sending menu items:', menuItems);
        res.json(menuItems);
    } catch (error) {
        console.error('Error fetching menu items:', error);
        res.status(500).json({ message: 'Error fetching menu items' });
    }
});

// Create a new menu item
router.post('/', auth, async (req, res) => {
    try {
        const { dishName, price, mealType, foodType, portionSize } = req.body;

        // Validate required fields
        if (!dishName || !price || !mealType || !foodType || !portionSize) {
            return res.status(400).json({ 
                message: 'Missing required fields',
                required: ['dishName', 'price', 'mealType', 'foodType', 'portionSize']
            });
        }

        // Validate enum values
        const validMealTypes = ['Lunch', 'Dinner'];
        const validFoodTypes = ['Veg', 'Non-veg'];
        const validPortionSizes = ['Half', 'Full'];

        if (!validMealTypes.includes(mealType)) {
            return res.status(400).json({ message: 'Invalid meal type. Must be Lunch or Dinner' });
        }

        if (!validFoodTypes.includes(foodType)) {
            return res.status(400).json({ message: 'Invalid food type. Must be Veg or Non-veg' });
        }

        if (!validPortionSizes.includes(portionSize)) {
            return res.status(400).json({ message: 'Invalid portion size. Must be Half or Full' });
        }

        const menuItem = new Menu({
            dishName,
            price,
            mealType,
            foodType,
            portionSize
        });

        await menuItem.save();
        res.status(201).json(menuItem);
    } catch (error) {
        console.error('Error creating menu item:', error);
        res.status(500).json({ message: 'Error creating menu item' });
    }
});

// Update a menu item
router.put('/:id', auth, async (req, res) => {
    try {
        const { dishName, price, mealType, foodType, portionSize } = req.body;
        const updates = {};

        if (dishName) updates.dishName = dishName;
        if (price) updates.price = price;
        if (mealType) {
            const validMealTypes = ['Lunch', 'Dinner'];
            if (!validMealTypes.includes(mealType)) {
                return res.status(400).json({ message: 'Invalid meal type' });
            }
            updates.mealType = mealType;
        }
        if (foodType) {
            const validFoodTypes = ['Veg', 'Non-veg'];
            if (!validFoodTypes.includes(foodType)) {
                return res.status(400).json({ message: 'Invalid food type' });
            }
            updates.foodType = foodType;
        }
        if (portionSize) {
            const validPortionSizes = ['Half', 'Full'];
            if (!validPortionSizes.includes(portionSize)) {
                return res.status(400).json({ message: 'Invalid portion size' });
            }
            updates.portionSize = portionSize;
        }

        const menuItem = await Menu.findByIdAndUpdate(
            req.params.id,
            { $set: updates },
            { new: true }
        );

        if (!menuItem) {
            return res.status(404).json({ message: 'Menu item not found' });
        }

        res.json(menuItem);
    } catch (error) {
        console.error('Error updating menu item:', error);
        res.status(500).json({ message: 'Error updating menu item' });
    }
});

module.exports = router;
