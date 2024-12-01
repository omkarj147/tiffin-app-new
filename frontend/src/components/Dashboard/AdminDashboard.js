import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaUsers, FaUtensils, FaChartBar, FaCog } from 'react-icons/fa';
import UserManagement from './UserManagement';
import OrderManagement from './OrderManagement';
import ReportsManagement from './ReportsManagement';
import './Dashboard.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeComponent, setActiveComponent] = useState(null);

  useEffect(() => {
    // Get user data from localStorage
    const userData = localStorage.getItem('user');
    if (!userData) {
      navigate('/login');
      return;
    }

    const parsedUser = JSON.parse(userData);
    if (parsedUser.userType !== 'admin') {
      navigate('/login');
      return;
    }

    setUser(parsedUser);
  }, [navigate]);

  if (!user) return null;

  const handleComponentChange = (component) => {
    setActiveComponent(component);
  };

  if (activeComponent === 'users') {
    return <UserManagement onBack={() => setActiveComponent(null)} />;
  }

  if (activeComponent === 'orders') {
    return <OrderManagement onBack={() => setActiveComponent(null)} />;
  }

  if (activeComponent === 'reports') {
    return <ReportsManagement onBack={() => setActiveComponent(null)} />;
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Welcome, {user.name}!</h1>
        <p>Admin Dashboard</p>
      </div>
      
      <div className="dashboard-grid">
        <div className="dashboard-card">
          <FaChartBar className="card-icon" />
          <h3>Orders Management</h3>
          <p>View and manage all customer orders</p>
          <button 
            className="dashboard-button"
            onClick={() => handleComponentChange('orders')}
          >
            Manage Orders
          </button>
        </div>

        <div className="dashboard-card">
          <FaUsers className="card-icon" />
          <h3>User Management</h3>
          <p>Manage customer accounts</p>
          <button 
            className="dashboard-button"
            onClick={() => handleComponentChange('users')}
          >
            Manage Users
          </button>
        </div>

        <div className="dashboard-card">
          <FaUtensils className="card-icon" />
          <h3>Menu Management</h3>
          <p>Add and manage menu items</p>
          <Link to="/admin/menu" className="dashboard-button">Manage Menu</Link>
        </div>

        <div className="dashboard-card">
          <FaCog className="card-icon" />
          <h3>Reports</h3>
          <p>View business analytics</p>
          <button 
            className="dashboard-button"
            onClick={() => handleComponentChange('reports')}
          >
            View Reports
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
