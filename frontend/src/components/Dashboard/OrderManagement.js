import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaShoppingBag, FaTrash, FaMoneyBill } from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './OrderManagement.css';

const OrderManagement = ({ onBack }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('active'); // 'active', 'delivered', or 'cancelled'

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('tiffin-app-backend.onrender.com/api/orders', {
        headers: {
          Authorization: `Bearer ${token}`
        },
        params: {
          populate: 'items.menuItemId userId'  // Fixed populate parameter
        }
      });
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `tiffin-app-backend.onrender.com/api/orders/${orderId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      
      setOrders(orders.map(order => 
        order._id === orderId ? response.data : order
      ));
      
      toast.success(`Order status updated to ${newStatus}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error updating order status');
    }
  };

  const handlePaymentStatusChange = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `tiffin-app-backend.onrender.com/api/orders/${orderId}/payment`,
        { paymentStatus: newStatus },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      
      setOrders(orders.map(order => 
        order._id === orderId ? response.data : order
      ));
      
      toast.success(`Payment status updated to ${newStatus}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error updating payment status');
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to delete this order?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`tiffin-app-backend.onrender.com/api/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setOrders(orders.filter(order => order._id !== orderId));
      toast.success('Order deleted successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error deleting order');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#ffa500',
      confirmed: '#007bff',
      preparing: '#800080',
      ready: '#008000',
      delivered: '#006400',
      cancelled: '#ff0000'
    };
    return colors[status] || '#000000';
  };

  const getPaymentStatusColor = (status) => {
    const colors = {
      pending: '#ffa500',
      completed: '#008000',
      failed: '#ff0000'
    };
    return colors[status] || '#000000';
  };

  const getFilteredOrders = () => {
    const searchFiltered = orders.filter(order =>
      order.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order._id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    switch (activeTab) {
      case 'active':
        return searchFiltered.filter(order => 
          ['pending', 'confirmed', 'preparing', 'ready'].includes(order.status));
      case 'delivered':
        return searchFiltered.filter(order => order.status === 'delivered');
      case 'cancelled':
        return searchFiltered.filter(order => order.status === 'cancelled');
      default:
        return searchFiltered;
    }
  };

  const getTabTitle = (tab) => {
    const count = orders.filter(order => {
      switch (tab) {
        case 'active':
          return ['pending', 'confirmed', 'preparing', 'ready'].includes(order.status);
        case 'delivered':
          return order.status === 'delivered';
        case 'cancelled':
          return order.status === 'cancelled';
        default:
          return false;
      }
    }).length;
    
    const titles = {
      active: 'Active Orders',
      delivered: 'Delivered Orders',
      cancelled: 'Cancelled Orders'
    };
    
    return `${titles[tab]} (${count})`;
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="order-management">
      <div className="order-management-header">
        <div className="header-left">
          <button className="back-button" onClick={onBack}>
            ← Back to Dashboard
          </button>
          <h2>Order Management</h2>
        </div>
        <div className="header-right">
          <div className="search-filter-container">
            <input
              type="text"
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>
      </div>

      <div className="order-tabs">
        <button 
          className={`tab-button ${activeTab === 'active' ? 'active' : ''}`}
          onClick={() => setActiveTab('active')}
        >
          {getTabTitle('active')}
        </button>
        <button 
          className={`tab-button ${activeTab === 'delivered' ? 'active' : ''}`}
          onClick={() => setActiveTab('delivered')}
        >
          {getTabTitle('delivered')}
        </button>
        <button 
          className={`tab-button ${activeTab === 'cancelled' ? 'active' : ''}`}
          onClick={() => setActiveTab('cancelled')}
        >
          {getTabTitle('cancelled')}
        </button>
      </div>

      <div className="orders-container">
        {loading ? (
          <div className="loading">Loading orders...</div>
        ) : (
          <div className="orders-grid">
            {getFilteredOrders().map((order) => (
              <div key={order._id} className="order-card">
                <div className="order-header">
                  <div className="order-id">Order #{order._id.slice(-6)}</div>
                  <div className={`order-status status-${order.status}`}>
                    {order.status}
                  </div>
                </div>

                <div className="order-customer">
                  <strong>Customer:</strong> {order.userId?.name || 'N/A'}
                </div>

                <div className="order-details">
                  <div className="order-type-info">
                    <div className="type-badge meal-type">
                      {order.mealType || 'N/A'}
                    </div>
                    <div className="type-badge food-type">
                      {order.foodType || 'N/A'}
                    </div>
                    <div className="type-badge portion-size">
                      {order.portionSize || 'N/A'}
                    </div>
                  </div>

                  <div className="order-items">
                    <strong>Items:</strong>
                    {order.items.map((item, index) => (
                      <div key={index} className="order-item">
                        {item.menuItemId?.dishName} × {item.quantity}
                      </div>
                    ))}
                  </div>

                  <div className="order-amount">
                    <strong>Total:</strong> ₹{order.totalAmount}
                  </div>
                </div>

                <div className="order-actions">
                  {activeTab === 'active' && (
                    <div className="status-actions">
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                        style={{ color: getStatusColor(order.status) }}
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="preparing">Preparing</option>
                        <option value="ready">Ready</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                  )}
                  <div className="payment-actions">
                    <select
                      value={order.paymentStatus}
                      onChange={(e) => handlePaymentStatusChange(order._id, e.target.value)}
                      style={{ color: getPaymentStatusColor(order.paymentStatus) }}
                    >
                      <option value="pending">Payment Pending</option>
                      <option value="completed">Payment Completed</option>
                      <option value="failed">Payment Failed</option>
                    </select>
                  </div>
                  <button
                    className="delete-button"
                    onClick={() => handleDeleteOrder(order._id)}
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <ToastContainer position="bottom-right" />
    </div>
  );
};

export default OrderManagement;
