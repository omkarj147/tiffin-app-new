import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Orders.css';

const Orders = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);

    try {
      // Test the base API endpoint
      await axios.get('http://localhost:5002/api/test');

      // Test the orders router
      await axios.get('http://localhost:5002/api/orders/test');

      const token = localStorage.getItem('token');
      if (!token) throw new Error('User is not authenticated.');

      const response = await axios.get('http://localhost:5002/api/orders/my-orders', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      setOrders(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch orders.');
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const cancelOrder = async (orderId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('User is not authenticated.');

      // Find the order to get its amount
      const order = orders.find(o => o._id === orderId);
      if (!order) {
        throw new Error('Order not found');
      }

      // Cancel the order
      await axios.put(`http://localhost:5002/api/orders/${orderId}/cancel`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      // Refund the amount to wallet
      await axios.post('http://localhost:5002/api/wallet/add-funds', {
        amount: order.totalAmount,
        description: `Refund for order #${orderId.slice(-8)}`
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      // Show success message
      setSuccessMessage('Order cancelled and amount refunded to wallet');
      setTimeout(() => setSuccessMessage(''), 3000);

      // Refresh orders after cancellation
      fetchOrders();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cancel order.');
      console.error('Error canceling order:', err);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  if (loading) return (
    <div className="orders-loading">
      <div className="loader"></div>
      <p>Loading your orders...</p>
    </div>
  );

  if (error) return (
    <div className="orders-error">
      <div className="error-icon">❌</div>
      <p>{error}</p>
    </div>
  );

  return (
    <div className="orders-container">
      {successMessage && (
        <div className="success-popup">
          {successMessage}
        </div>
      )}
      <div className="orders-header">
        <button className="back-button" onClick={() => navigate('/member/dashboard')}>Back to Dashboard</button>
        <h1>My Orders</h1>
        <div className="orders-count">{orders.length} {orders.length === 1 ? 'Order' : 'Orders'}</div>
      </div>

      {/* Active Orders Section */}
      <div className="orders-section">
        <h2 className="section-title">Active Orders</h2>
        <div className="orders-list">
          {orders
            .filter(order => !['cancelled', 'delivered'].includes(order.status.toLowerCase()))
            .map(order => (
              <div key={order._id} className="order-card">
                <div className="order-card-header">
                  <div className="order-info">
                    <div className="order-number">
                      <span className="label">Order #</span>
                      <span className="value">{order._id.slice(-8)}</span>
                    </div>
                    <div className={`order-status status-${order.status.toLowerCase()}`}>
                      {order.status}
                    </div>
                  </div>
                  <div className="order-date">
                    {new Date(order.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </div>
                </div>

                <div className="order-items-list">
                  {order.items.map(item => (
                    <div key={item.menuItemId._id} className="order-item">
                      <div className="item-details">
                        <span className="item-name">{item.menuItemId.dishName}</span>
                        <div className="item-meta">
                          <span className="item-quantity">Qty: {item.quantity}</span>
                          <span className="item-price">
                            ₹{(item.menuItemId.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="order-card-footer">
                  <div className="order-total">
                    <span className="total-label">Total Amount</span>
                    <span className="total-value">₹{order.totalAmount.toFixed(2)}</span>
                  </div>
                  <button 
                    className="cancel-order-btn" 
                    onClick={() => cancelOrder(order._id)}
                  >
                    Cancel Order
                    <span className="btn-icon">×</span>
                  </button>
                </div>
              </div>
            ))}
            {orders.filter(order => !['cancelled', 'delivered'].includes(order.status.toLowerCase())).length === 0 && (
              <div className="no-orders">
                <p>No active orders at the moment</p>
              </div>
            )}
        </div>
      </div>

      {/* Completed Orders Section */}
      <div className="orders-section">
        <h2 className="section-title">Past Orders</h2>
        <div className="orders-list">
          {orders
            .filter(order => ['cancelled', 'delivered'].includes(order.status.toLowerCase()))
            .map(order => (
              <div key={order._id} className="order-card">
                <div className="order-card-header">
                  <div className="order-info">
                    <div className="order-number">
                      <span className="label">Order #</span>
                      <span className="value">{order._id.slice(-8)}</span>
                    </div>
                    <div className={`order-status status-${order.status.toLowerCase()}`}>
                      {order.status}
                    </div>
                  </div>
                  <div className="order-date">
                    {new Date(order.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </div>
                </div>

                <div className="order-items-list">
                  {order.items.map(item => (
                    <div key={item.menuItemId._id} className="order-item">
                      <div className="item-details">
                        <span className="item-name">{item.menuItemId.dishName}</span>
                        <div className="item-meta">
                          <span className="item-quantity">Qty: {item.quantity}</span>
                          <span className="item-price">
                            ₹{(item.menuItemId.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="order-card-footer">
                  <div className="order-total">
                    <span className="total-label">Total Amount</span>
                    <span className="total-value">₹{order.totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ))}
            {orders.filter(order => ['cancelled', 'delivered'].includes(order.status.toLowerCase())).length === 0 && (
              <div className="no-orders">
                <p>No past orders</p>
              </div>
            )}
        </div>
      </div>

      {orders.length === 0 && (
        <div className="no-orders">
          <div className="empty-icon">🛍️</div>
          <h3>No Orders Yet</h3>
          <p>When you place an order, it will appear here</p>
        </div>
      )}
    </div>
  );
};

export default Orders;
