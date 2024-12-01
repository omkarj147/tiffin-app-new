import React, { useState, useEffect } from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import './MenuManagement.css';

const MenuManagement = () => {
  const navigate = useNavigate();
  const [menuItems, setMenuItems] = useState([]);
  const [menuItem, setMenuItem] = useState({
    dishName: '',
    mealType: '',
    foodType: '',
    portionSize: '',
    price: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    try {
      const response = await axios.get('http://localhost:5002/api/menu');
      setMenuItems(response.data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error fetching menu items');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setMenuItem(prev => {
      const newValue = name === 'price'
        ? (value === '' ? '' : parseFloat(value) || prev.price)
        : value;

      return {
        ...prev,
        [name]: newValue
      };
    });
  };

  const resetForm = () => {
    setMenuItem({
      dishName: '',
      mealType: '',
      foodType: '',
      portionSize: '',
      price: ''
    });
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user'));

      if (!token || !user || user.userType !== 'admin') {
        toast.error('You must be logged in as an admin to perform this action');
        return;
      }

      const config = {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      };

      if (editingId) {
        await axios.put(`http://localhost:5002/api/menu/${editingId}`, menuItem, config);
        toast.success('Menu item updated successfully!');
      } else {
        await axios.post('http://localhost:5002/api/menu', menuItem, config);
        toast.success('Menu item added successfully!');
      }
      fetchMenuItems();
      resetForm();
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Error processing menu item';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    setMenuItem({
      dishName: item.dishName,
      mealType: item.mealType,
      foodType: item.foodType,
      portionSize: item.portionSize,
      price: item.price
    });
    setEditingId(item._id);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this menu item?')) {
      try {
        const token = localStorage.getItem('token');
        const config = {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        };
        await axios.delete(`http://localhost:5002/api/menu/${id}`, config);
        toast.success('Menu item deleted successfully!');
        fetchMenuItems();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Error deleting menu item');
      }
    }
  };

  const handleBack = () => {
    navigate('/admin/dashboard');
  };

  return (
    <div className="menu-management">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      
      <div className="menu-header">
        <button className="back-button" onClick={handleBack}>
          ← Back to Dashboard
        </button>
        <h2>Menu Management</h2>
      </div>

      <form onSubmit={handleSubmit} className="menu-form">
        <div className="form-group">
          <input
            type="text"
            id="dishName"
            name="dishName"
            value={menuItem.dishName}
            onChange={handleChange}
            required
            placeholder="Enter dish name"
            autoComplete="off"
          />
        </div>

        <div className="form-group">
          <select
            id="mealType"
            name="mealType"
            value={menuItem.mealType}
            onChange={handleChange}
            required
          >
            <option value="">Select meal type</option>
            <option value="Lunch">Lunch</option>
            <option value="Dinner">Dinner</option>
          </select>
        </div>

        <div className="form-group">
          <select
            id="foodType"
            name="foodType"
            value={menuItem.foodType}
            onChange={handleChange}
            required
          >
            <option value="">Select food type</option>
            <option value="Veg">Veg</option>
            <option value="Non-veg">Non-veg</option>
          </select>
        </div>

        <div className="form-group">
          <select
            id="portionSize"
            name="portionSize"
            value={menuItem.portionSize}
            onChange={handleChange}
            required
          >
            <option value="">Select portion size</option>
            <option value="Half">Half</option>
            <option value="Full">Full</option>
          </select>
        </div>

        <div className="form-group">
          <input
            type="number"
            id="price"
            name="price"
            value={menuItem.price}
            onChange={handleChange}
            required
            min="0"
            step="0.01"
            placeholder="Enter price"
            autoComplete="off"
          />
        </div>

        <div className="form-actions">
          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? 'Processing...' : editingId ? 'Update Menu Item' : 'Add Menu Item'}
          </button>
          {editingId && (
            <button type="button" className="cancel-button" onClick={resetForm}>
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="menu-items-section">
        <h3>Menu Items</h3>
        <div className="menu-items-grid">
          {menuItems.map(item => (
            <div key={item._id} className="menu-item-card">
              <div className="card-header">
                <h4>{item.dishName}</h4>
                <span className={`food-type ${item.foodType.toLowerCase()}`}>
                  {item.foodType}
                </span>
              </div>
              <div className="card-body">
                <div className="item-info">
                  <span className="meal-type">{item.mealType}</span>
                  <span className="portion-size">{item.portionSize}</span>
                </div>
                <div className="price">₹{item.price}</div>
              </div>
              <div className="card-actions">
                <button
                  className="edit-button"
                  onClick={() => handleEdit(item)}
                >
                  <FaEdit /> Edit
                </button>
                <button
                  className="delete-button"
                  onClick={() => handleDelete(item._id)}
                >
                  <FaTrash /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MenuManagement;
