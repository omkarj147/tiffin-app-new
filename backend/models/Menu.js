const mongoose = require('mongoose');

const menuSchema = new mongoose.Schema({
  dishName: {
    type: String,
    required: true,
    trim: true
  },
  mealType: {
    type: String,
    required: true,
    enum: ['Lunch', 'Dinner']
  },
  foodType: {
    type: String,
    required: true,
    enum: ['Veg', 'Non-veg']
  },
  portionSize: {
    type: String,
    required: true,
    enum: ['Half', 'Full']
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

const Menu = mongoose.model('Menu', menuSchema);

module.exports = Menu;
