import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUser, FaBars, FaTimes } from 'react-icons/fa';
import './Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showPopover, setShowPopover] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [user, setUser] = useState(null);
  const popoverRef = useRef(null);
  const mobileMenuRef = useRef(null);

  const checkAuthStatus = useCallback(() => {
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (userData && token) {
      setIsLoggedIn(true);
      setUser(JSON.parse(userData));
    } else {
      setIsLoggedIn(false);
      setUser(null);
    }
  }, []);

  useEffect(() => {
    checkAuthStatus();
    window.addEventListener('userLogin', checkAuthStatus);
    window.addEventListener('storage', checkAuthStatus);

    return () => {
      window.removeEventListener('userLogin', checkAuthStatus);
      window.removeEventListener('storage', checkAuthStatus);
    };
  }, [checkAuthStatus]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        setShowPopover(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setShowMobileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setUser(null);
    setShowPopover(false);
    setShowMobileMenu(false);
    window.dispatchEvent(new Event('userLogin'));
    navigate('/');
  };

  const handleViewProfile = () => {
    setShowPopover(false);
    setShowMobileMenu(false);
    navigate('/profile');
  };

  const handleNavigation = (path) => {
    setShowMobileMenu(false);
    navigate(path);
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">Tiffin Service</Link>
        <button 
          className="mobile-menu-button"
          onClick={() => setShowMobileMenu(!showMobileMenu)}
        >
          {showMobileMenu ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      <div className={`navbar-links ${showMobileMenu ? 'show-mobile' : ''}`} ref={mobileMenuRef}>
        <Link to="/" onClick={() => setShowMobileMenu(false)}>Home</Link>
        {isLoggedIn && user && (
          <Link 
            to={user.userType === 'admin' ? '/admin/dashboard' : '/member/dashboard'} 
            className="dashboard-link"
            onClick={() => setShowMobileMenu(false)}
          >
            Dashboard
          </Link>
        )}
        {isLoggedIn && user ? (
          <div className="profile-section" ref={popoverRef}>
            <button 
              className="profile-button"
              onClick={() => setShowPopover(!showPopover)}
            >
              <FaUser className="profile-icon" />
              <span className="profile-name">{user.name || 'User'}</span>
            </button>
            {showPopover && (
              <div className="profile-popover">
                <button onClick={handleViewProfile}>View Profile</button>
                <button onClick={handleLogout}>Logout</button>
              </div>
            )}
          </div>
        ) : (
          <div className="auth-links">
            <Link to="/login" onClick={() => setShowMobileMenu(false)}>Login</Link>
            <Link to="/signup" onClick={() => setShowMobileMenu(false)}>Sign Up</Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
