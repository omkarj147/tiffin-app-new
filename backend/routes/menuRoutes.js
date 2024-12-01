const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Menu = require('../models/Menu');

// Get all menu items
router.get('/', async (req, res) => {
  try {
    const menuItems = await Menu.find({ isDeleted: false })
      .sort({ createdAt: -1 });
    res.json(menuItems);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching menu items', error: error.message });
  }
});

// Add new menu item (Admin only)
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.userType !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const menuItem = new Menu({
      dishName: req.body.dishName,
      mealType: req.body.mealType,
      foodType: req.body.foodType,
      portionSize: req.body.portionSize,
      price: req.body.price
    });

    const savedMenuItem = await menuItem.save();
    res.status(201).json(savedMenuItem);
  } catch (error) {
    res.status(400).json({ message: 'Error adding menu item', error: error.message });
  }
});

// Update menu item (Admin only)
router.put('/:id', auth, async (req, res) => {
  try {
    if (req.user.userType !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const updatedMenuItem = await Menu.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          dishName: req.body.dishName,
          mealType: req.body.mealType,
          foodType: req.body.foodType,
          portionSize: req.body.portionSize,
          price: req.body.price,
          updatedAt: Date.now()
        }
      },
      { new: true }
    );

    if (!updatedMenuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }

    res.json(updatedMenuItem);
  } catch (error) {
    res.status(400).json({ message: 'Error updating menu item', error: error.message });
  }
});

// Soft delete menu item (Admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    if (req.user.userType !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const menuItem = await Menu.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          isDeleted: true,
          updatedAt: Date.now()
        }
      },
      { new: true }
    );

    if (!menuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }

    res.json({ message: 'Menu item deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: 'Error deleting menu item', error: error.message });
  }
});

module.exports = router;
