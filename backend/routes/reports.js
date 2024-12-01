const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Order = require('../models/Order');
const Menu = require('../models/Menu');
const User = require('../models/User');
const PDFDocument = require('pdfkit');

// Helper function to get date range
const getDateRange = (range) => {
  const now = new Date();
  switch (range) {
    case 'week':
      return new Date(now - 7 * 24 * 60 * 60 * 1000);
    case 'month':
      return new Date(now - 30 * 24 * 60 * 60 * 1000);
    case 'year':
      return new Date(now - 365 * 24 * 60 * 60 * 1000);
    default:
      return new Date(now - 7 * 24 * 60 * 60 * 1000);
  }
};

// Helper function to get date range
const getDateRangeExact = (date) => {
  const startDate = new Date(date);
  startDate.setHours(0, 0, 0, 0);
  const endDate = new Date(date);
  endDate.setHours(23, 59, 59, 999);
  return { startDate, endDate };
};

// Get order insights
router.get('/orders', auth, async (req, res) => {
  try {
    const startDate = getDateRange(req.query.range);
    
    // Get all orders within date range
    const orders = await Order.find({
      createdAt: { $gte: startDate }
    }).populate('items.menuItemId userId');

    // Calculate metrics
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const averageOrderValue = totalRevenue / totalOrders || 0;

    // Get order status distribution
    const statusDistribution = orders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {});

    // Get recent orders
    const recentOrders = orders
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 5)
      .map(order => ({
        orderId: order._id,
        total: order.totalAmount,
        date: order.createdAt
      }));

    // Calculate order trends (daily totals)
    const orderTrends = orders.reduce((acc, order) => {
      const date = order.createdAt.toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

    res.json({
      totalOrders,
      totalRevenue,
      averageOrderValue,
      statusDistribution,
      recentOrders,
      orderTrends
    });
  } catch (error) {
    console.error('Error fetching order insights:', error);
    res.status(500).json({ message: 'Error fetching order insights' });
  }
});

// Get menu insights
router.get('/menu', auth, async (req, res) => {
  try {
    const startDate = getDateRange(req.query.range);
    
    // Get all orders within date range
    const orders = await Order.find({
      createdAt: { $gte: startDate }
    }).populate('items.menuItemId');

    // Calculate top dishes
    const dishCounts = {};
    orders.forEach(order => {
      order.items.forEach(item => {
        if (item.menuItemId) {
          const dishId = item.menuItemId._id.toString();
          dishCounts[dishId] = (dishCounts[dishId] || 0) + item.quantity;
        }
      });
    });

    const topDishes = await Promise.all(
      Object.entries(dishCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(async ([dishId, count]) => {
          const menuItem = await Menu.findById(dishId);
          return {
            name: menuItem.dishName,
            orderCount: count
          };
        })
    );

    // Get meal type distribution from orders
    const mealTypeDistribution = orders.reduce((acc, order) => {
      acc[order.mealType] = (acc[order.mealType] || 0) + 1;
      return acc;
    }, {});

    // Get food type distribution from orders
    const foodTypeDistribution = orders.reduce((acc, order) => {
      acc[order.foodType] = (acc[order.foodType] || 0) + 1;
      return acc;
    }, {});

    // Get portion size distribution from orders
    const portionSizeDistribution = orders.reduce((acc, order) => {
      acc[order.portionSize] = (acc[order.portionSize] || 0) + 1;
      return acc;
    }, {});

    res.json({
      topDishes,
      mealTypeDistribution,
      foodTypeDistribution,
      portionSizeDistribution
    });
  } catch (error) {
    console.error('Error fetching menu insights:', error);
    res.status(500).json({ message: 'Error fetching menu insights' });
  }
});

// Get customer insights
router.get('/customers', auth, async (req, res) => {
  try {
    const startDate = getDateRange(req.query.range);
    
    // Get all orders within date range
    const orders = await Order.find({
      createdAt: { $gte: startDate }
    }).populate('userId');

    // Get total unique customers
    const uniqueCustomers = new Set(orders.map(order => 
      order.userId ? order.userId._id.toString() : null
    ));
    const totalCustomers = uniqueCustomers.size;

    // Calculate new vs repeat customers
    const customerOrders = {};
    orders.forEach(order => {
      if (order.userId) {
        const userId = order.userId._id.toString();
        customerOrders[userId] = (customerOrders[userId] || 0) + 1;
      }
    });

    const newCustomers = Object.values(customerOrders).filter(count => count === 1).length;
    const repeatCustomers = Object.values(customerOrders).filter(count => count > 1).length;

    // Get top customers by total spent
    const customerSpending = {};
    orders.forEach(order => {
      if (order.userId) {
        const userId = order.userId._id.toString();
        customerSpending[userId] = (customerSpending[userId] || 0) + order.totalAmount;
      }
    });

    const topCustomers = await Promise.all(
      Object.entries(customerSpending)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(async ([userId, total]) => {
          const user = await User.findById(userId);
          return {
            name: user.name,
            totalSpent: total
          };
        })
    );

    res.json({
      totalCustomers,
      newCustomers,
      repeatCustomers,
      topCustomers
    });
  } catch (error) {
    console.error('Error fetching customer insights:', error);
    res.status(500).json({ message: 'Error fetching customer insights' });
  }
});

// Main reports route that combines all data
router.get('/', auth, async (req, res) => {
  try {
    let query = {};
    
    // If date is provided, filter by date
    if (req.query.date) {
      const startDate = new Date(req.query.date);
      startDate.setHours(0, 0, 0, 0);
      
      const endDate = new Date(req.query.date);
      endDate.setHours(23, 59, 59, 999);
      
      query.createdAt = {
        $gte: startDate,
        $lte: endDate
      };
    }

    // Get all orders for the date with all fields
    const orders = await Order.find(query);
    
    // Calculate totals
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);

    // Count lunch and dinner orders
    const lunchOrders = orders.filter(order => order.mealType === 'LUNCH');
    const dinnerOrders = orders.filter(order => order.mealType === 'DINNER');

    // Count lunch orders by food type
    const lunchVegOrders = lunchOrders.filter(order => order.foodType === 'VEG');
    const lunchNonVegOrders = lunchOrders.filter(order => order.foodType === 'NON-VEG');

    // Count lunch veg orders by portion size
    const lunchVegHalfOrders = lunchVegOrders.filter(order => order.portionSize === 'HALF').length;
    const lunchVegFullOrders = lunchVegOrders.filter(order => order.portionSize === 'FULL').length;

    // Count lunch non-veg orders by portion size
    const lunchNonVegHalfOrders = lunchNonVegOrders.filter(order => order.portionSize === 'HALF').length;
    const lunchNonVegFullOrders = lunchNonVegOrders.filter(order => order.portionSize === 'FULL').length;

    // Count dinner orders by food type
    const dinnerVegOrders = dinnerOrders.filter(order => order.foodType === 'VEG');
    const dinnerNonVegOrders = dinnerOrders.filter(order => order.foodType === 'NON-VEG');

    // Count dinner veg orders by portion size
    const dinnerVegHalfOrders = dinnerVegOrders.filter(order => order.portionSize === 'HALF').length;
    const dinnerVegFullOrders = dinnerVegOrders.filter(order => order.portionSize === 'FULL').length;

    // Count dinner non-veg orders by portion size
    const dinnerNonVegHalfOrders = dinnerNonVegOrders.filter(order => order.portionSize === 'HALF').length;
    const dinnerNonVegFullOrders = dinnerNonVegOrders.filter(order => order.portionSize === 'FULL').length;

    console.log('Date Query:', query);
    console.log('Total Orders Found:', orders.length);
    console.log('Orders by Meal Type:', {
      lunch: lunchOrders.length,
      dinner: dinnerOrders.length,
      lunchVeg: lunchVegOrders.length,
      lunchVegHalf: lunchVegHalfOrders,
      lunchVegFull: lunchVegFullOrders,
      lunchNonVeg: lunchNonVegOrders.length,
      lunchNonVegHalf: lunchNonVegHalfOrders,
      lunchNonVegFull: lunchNonVegFullOrders,
      dinnerVeg: dinnerVegOrders.length,
      dinnerVegHalf: dinnerVegHalfOrders,
      dinnerVegFull: dinnerVegFullOrders,
      dinnerNonVeg: dinnerNonVegOrders.length,
      dinnerNonVegHalf: dinnerNonVegHalfOrders,
      dinnerNonVegFull: dinnerNonVegFullOrders
    });
    
    // Send response
    res.json({
      totalOrders,
      totalRevenue,
      lunchOrders: lunchOrders.length,
      dinnerOrders: dinnerOrders.length,
      lunchVegOrders: lunchVegOrders.length,
      lunchVegHalfOrders,
      lunchVegFullOrders,
      lunchNonVegOrders: lunchNonVegOrders.length,
      lunchNonVegHalfOrders,
      lunchNonVegFullOrders,
      dinnerVegOrders: dinnerVegOrders.length,
      dinnerVegHalfOrders,
      dinnerVegFullOrders,
      dinnerNonVegOrders: dinnerNonVegOrders.length,
      dinnerNonVegHalfOrders,
      dinnerNonVegFullOrders,
      date: req.query.date || null
    });

  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({
      message: 'Error fetching reports',
      error: error.message
    });
  }
});

// Export report as PDF
router.get('/export', auth, async (req, res) => {
  try {
    const startDate = getDateRange(req.query.range);
    
    // Fetch all insights
    const orders = await Order.find({
      createdAt: { $gte: startDate }
    }).populate('items.menuItemId userId');

    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=business-insights-${req.query.range}.pdf`);
    doc.pipe(res);

    // Add content to PDF
    doc.fontSize(25).text('Business Insights Report', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Report Period: ${startDate.toLocaleDateString()} - ${new Date().toLocaleDateString()}`);
    doc.moveDown();

    // Overview
    doc.fontSize(16).text('Business Overview');
    doc.fontSize(12).text(`Total Orders: ${orders.length}`);
    doc.text(`Total Revenue: ₹${orders.reduce((sum, order) => sum + order.totalAmount, 0).toFixed(2)}`);
    doc.moveDown();

    // Top Dishes
    const dishCounts = {};
    orders.forEach(order => {
      order.items.forEach(item => {
        if (item.menuItemId) {
          const dishName = item.menuItemId.dishName;
          dishCounts[dishName] = (dishCounts[dishName] || 0) + item.quantity;
        }
      });
    });

    doc.fontSize(16).text('Top Performing Dishes');
    Object.entries(dishCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .forEach(([dish, count]) => {
        doc.fontSize(12).text(`${dish}: ${count} orders`);
      });

    doc.end();
  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({ message: 'Error generating report' });
  }
});

module.exports = router;
