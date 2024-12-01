import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaUtensils, FaUser, FaShoppingCart, FaSignOut, FaWallet } from 'react-icons/fa';
import './Dashboard.css';

const MemberDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeComponent, setActiveComponent] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [walletBalance, setWalletBalance] = useState(0);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5002/api/orders/my-orders', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      setOrders(response.data);
    } catch (err) {
      setError('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const fetchWalletBalance = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5002/api/wallet/balance', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setWalletBalance(response.data.balance);
    } catch (err) {
      setError('Failed to fetch wallet balance');
    }
  };

  // Handle order cancellation with refund
  const handleOrderCancellation = async (orderId, userId, amount) => {
    try {
      const token = localStorage.getItem('token');
      
      // First cancel the order
      const cancelResponse = await axios.put(
        `http://localhost:5002/api/orders/${orderId}/cancel`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (cancelResponse.data) {
        // Process refund after successful cancellation
        const refundResponse = await axios.post(
          'http://localhost:5002/api/wallet/refund',
          {
            userId,
            amount,
            orderId
          },
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (refundResponse.data) {
          // Update orders list and wallet balance
          fetchOrders();
          fetchWalletBalance();
        }
      }
    } catch (error) {
      setError('Failed to cancel order and process refund');
    }
  };

  useEffect(() => {
    // Get user data from localStorage
    const userData = localStorage.getItem('user');
    if (!userData) {
      navigate('/login');
      return;
    }

    const parsedUser = JSON.parse(userData);
    if (parsedUser.userType !== 'member') {
      navigate('/login');
      return;
    }

    setUser(parsedUser);
    fetchOrders(); // Fetch orders when component mounts
    fetchWalletBalance(); // Fetch wallet balance
  }, [navigate]);

  if (!user) return null;

  const renderOrders = () => (
    <div className="orders-section">
      <h2>My Orders</h2>
      {loading ? (
        <p>Loading orders...</p>
      ) : error ? (
        <p className="error-text">{error}</p>
      ) : orders.length === 0 ? (
        <p>No orders found</p>
      ) : (
        <div className="orders-list">
          {orders.map(order => (
            <div key={order._id} className="order-card">
              <h3>Order #{order._id.slice(-6)}</h3>
              <p>Date: {new Date(order.createdAt).toLocaleDateString()}</p>
              <p>Status: {order.status}</p>
              <p>Total: ₹{order.totalAmount}</p>
              <button 
                className="view-details-btn"
                onClick={() => navigate(`/orders/${order._id}`)}
              >
                View Details
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Welcome, {user.name}!</h1>
      </div>
      
      <div className="dashboard-grid">
        <div className="dashboard-card">
          <FaWallet className="card-icon" />
          <h3>My Wallet</h3>
          <p>Balance: ₹{walletBalance.toFixed(2)}</p>
          <button 
            className="dashboard-button"
            onClick={() => navigate('/wallet')}
          >
            Manage Wallet
          </button>
        </div>

        <div className="dashboard-card">
          <FaShoppingCart className="card-icon" />
          <h3>My Orders</h3>
          <p>View and track your tiffin orders</p>
          <button 
            className="dashboard-button"
            onClick={() => navigate('/orders')}
          >
            View Orders
          </button>
        </div>

        <div className="dashboard-card">
          <FaUtensils className="card-icon" />
          <h3>Menu</h3>
          <p>Browse today's menu and place orders</p>
          <button 
            className="dashboard-button"
            onClick={() => navigate('/menu')}
          >
            View Menu
          </button>
        </div>

        <div className="dashboard-card">
          <FaUser className="card-icon" />
          <h3>Profile</h3>
          <p>Update your profile information</p>
          <button 
            className="dashboard-button"
            onClick={() => navigate('/profile')}
          >
            Edit Profile
          </button>
        </div>
      </div>

      {activeComponent === 'orders' && renderOrders()}
    </div>
  );
};

export default MemberDashboard;
