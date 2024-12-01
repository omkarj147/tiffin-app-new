import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaUserAlt, FaTrash, FaBan, FaCheck } from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './UserManagement.css';

const UserManagement = ({ onBack }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5002/api/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(response.data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error fetching users');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (userId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:5002/api/users/${userId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      
      setUsers(users.map(user => 
        user._id === userId ? { ...user, status: newStatus } : user
      ));
      
      toast.success(`User ${newStatus === 'active' ? 'activated' : 'suspended'} successfully`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error updating user status');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5002/api/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setUsers(users.filter(user => user._id !== userId));
      toast.success('User deleted successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error deleting user');
    }
  };

  const filteredUsers = users.filter(user => 
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="user-management">
      <ToastContainer position="top-right" />
      
      <div className="user-management-header">
        <div className="header-left">
          <button className="back-button" onClick={onBack}>
            ← Back to Dashboard
          </button>
          <h2>User Management</h2>
        </div>
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="users-grid">
        {filteredUsers.map(user => (
          <div key={user._id} className={`user-card ${user.status}`}>
            <div className="user-icon">
              <FaUserAlt />
            </div>
            <div className="user-info">
              <h3>{user.name}</h3>
              <p>{user.email}</p>
              <p className="user-type">Type: {user.userType}</p>
              <p className={`user-status ${user.status}`}>
                Status: {user.status}
              </p>
            </div>
            <div className="user-actions">
              {user.status === 'active' ? (
                <button
                  className="suspend-button"
                  onClick={() => handleStatusChange(user._id, 'suspended')}
                  title="Suspend User"
                >
                  <FaBan />
                </button>
              ) : (
                <button
                  className="activate-button"
                  onClick={() => handleStatusChange(user._id, 'active')}
                  title="Activate User"
                >
                  <FaCheck />
                </button>
              )}
              <button
                className="delete-button"
                onClick={() => handleDeleteUser(user._id)}
                title="Delete User"
              >
                <FaTrash />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredUsers.length === 0 && (
        <div className="no-users">
          {searchTerm ? 'No users found matching your search.' : 'No users available.'}
        </div>
      )}
    </div>
  );
};

export default UserManagement;
