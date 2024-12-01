import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Profile.css';

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      navigate('/login');
      return;
    }
    setUser(JSON.parse(userData));
  }, [navigate]);

  if (!user) return null;

  return (
    <div className="profile-container">
      <div className="profile-card">
        <div className="profile-header">
          <div className="profile-avatar">
            <span>{user.name.charAt(0).toUpperCase()}</span>
          </div>
          <h1>{user.name}</h1>
          <p>{user.email}</p>
          <span className="user-type" >{user.userType}</span>
        </div>
        
        <div className="profile-info">
          <div className="info-section">
            <h3>Account Information</h3>
            <div className="info-item">
              <label>Name:</label>
              <span>{user.name}</span>
            </div>
            <div className="info-item">
              <label>Email:</label>
              <span>{user.email}</span>
            </div>
            <div className="info-item">
              <label>User Type:</label>
              <span>{user.userType}</span>
            </div>
            <div className="info-item">
              <label>Member Since:</label>
              <span>{new Date(user.createdAt).toLocaleDateString()}</span>
            </div>
          </div>

          <div className="profile-actions">
            <button className="edit-profile-btn">Edit Profile</button>
            <button className="change-password-btn">Change Password</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
