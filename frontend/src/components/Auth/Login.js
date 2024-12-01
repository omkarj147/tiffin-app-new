import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../../services/api';
import './Auth.css';

function Login() {
  const navigate = useNavigate();
  const [userType, setUserType] = useState('member');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await login(formData.email, formData.password, userType);
      
      // Store user data in localStorage
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify({
        ...response.user,
        userType: userType // Ensure userType is stored
      }));

      // Dispatch a custom event to notify navbar
      window.dispatchEvent(new Event('userLogin'));
      
      // Redirect based on user type
      if (userType === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/member/dashboard');
      }
    } catch (err) {
      setError(err.toString());
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <div className="auth-header">
          <h2>Welcome Back!</h2>
          <p>Please sign in to continue</p>
        </div>
        {error && <div className="error-message">{error}</div>}
        <div className="user-type-selector">
          <button
            className={`user-type-button ${userType === 'member' ? 'active' : ''}`}
            onClick={() => setUserType('member')}
            type="button"
          >
            Member
          </button>
          <button
            className={`user-type-button ${userType === 'admin' ? 'active' : ''}`}
            onClick={() => setUserType('admin')}
            type="button"
          >
            Admin
          </button>
        </div>
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder=" "
              required
            />
            <label htmlFor="email">Email</label>
          </div>
          <div className="form-group">
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder=" "
              required
            />
            <label htmlFor="password">Password</label>
          </div>
          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <div className="auth-switch">
          <p>
            Don't have an account?{' '}
            <Link to="/signup">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
