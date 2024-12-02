import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './ReportsManagement.css';

const ReportsManagement = () => {
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [lunchOrders, setLunchOrders] = useState(0);
  const [lunchVegOrders, setLunchVegOrders] = useState(0);
  const [lunchVegHalfOrders, setLunchVegHalfOrders] = useState(0);
  const [lunchVegFullOrders, setLunchVegFullOrders] = useState(0);
  const [lunchNonVegOrders, setLunchNonVegOrders] = useState(0);
  const [lunchNonVegHalfOrders, setLunchNonVegHalfOrders] = useState(0);
  const [lunchNonVegFullOrders, setLunchNonVegFullOrders] = useState(0);
  const [dinnerOrders, setDinnerOrders] = useState(0);
  const [dinnerVegOrders, setDinnerVegOrders] = useState(0);
  const [dinnerVegHalfOrders, setDinnerVegHalfOrders] = useState(0);
  const [dinnerVegFullOrders, setDinnerVegFullOrders] = useState(0);
  const [dinnerNonVegOrders, setDinnerNonVegOrders] = useState(0);
  const [dinnerNonVegHalfOrders, setDinnerNonVegHalfOrders] = useState(0);
  const [dinnerNonVegFullOrders, setDinnerNonVegFullOrders] = useState(0);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const onBack = () => {
    window.history.back();
  };

  const fetchReports = async (date) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.get(
        'tiffin-app-backend.onrender.com/api/reports',
        {
          params: { date },
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data) {
        setTotalOrders(response.data.totalOrders || 0);
        setTotalRevenue(response.data.totalRevenue || 0);
        setLunchOrders(response.data.lunchOrders || 0);
        setLunchVegOrders(response.data.lunchVegOrders || 0);
        setLunchVegHalfOrders(response.data.lunchVegHalfOrders || 0);
        setLunchVegFullOrders(response.data.lunchVegFullOrders || 0);
        setLunchNonVegOrders(response.data.lunchNonVegOrders || 0);
        setLunchNonVegHalfOrders(response.data.lunchNonVegHalfOrders || 0);
        setLunchNonVegFullOrders(response.data.lunchNonVegFullOrders || 0);
        setDinnerOrders(response.data.dinnerOrders || 0);
        setDinnerVegOrders(response.data.dinnerVegOrders || 0);
        setDinnerVegHalfOrders(response.data.dinnerVegHalfOrders || 0);
        setDinnerVegFullOrders(response.data.dinnerVegFullOrders || 0);
        setDinnerNonVegOrders(response.data.dinnerNonVegOrders || 0);
        setDinnerNonVegHalfOrders(response.data.dinnerNonVegHalfOrders || 0);
        setDinnerNonVegFullOrders(response.data.dinnerNonVegFullOrders || 0);
      }
    } catch (err) {
      console.error('Error fetching reports:', err);
      setError('Error fetching reports data');
    }
  };

  useEffect(() => {
    fetchReports(selectedDate);
  }, [selectedDate]);

  const handleDateChange = (event) => {
    setSelectedDate(event.target.value);
  };

  return (
    <div>
      <button className="back-button" onClick={onBack}>
        ← Back to Dashboard
      </button>
      <div className="reports-container">
        <h2>Reports Management</h2>
        <div className="date-filter">
          <input
            type="date"
            value={selectedDate}
            onChange={handleDateChange}
            className="date-input"
          />
        </div>
        <div className="reports-content">
          <div className="metrics-grid">
            <div className="metric-card">
              <h3>Total Orders</h3>
              <p>{totalOrders}</p>
              <span className="date-label">on {new Date(selectedDate).toLocaleDateString()}</span>
            </div>
            <div className="metric-card">
              <h3>Total Revenue</h3>
              <p>₹{totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              <span className="date-label">on {new Date(selectedDate).toLocaleDateString()}</span>
            </div>
            <div className="metric-card">
              <h3>Lunch Orders</h3>
              <p>{lunchOrders}</p>
              <div className="food-type-counts">
                <div className="veg-count">
                  <span>Veg: {lunchVegOrders}</span>
                  <div className="portion-counts">
                    <span className="half-count">Half: {lunchVegHalfOrders}</span>
                    <span className="full-count">Full: {lunchVegFullOrders}</span>
                  </div>
                </div>
                <div className="non-veg-count">
                  <span>Non-veg: {lunchNonVegOrders}</span>
                  <div className="portion-counts">
                    <span className="half-count">Half: {lunchNonVegHalfOrders}</span>
                    <span className="full-count">Full: {lunchNonVegFullOrders}</span>
                  </div>
                </div>
              </div>
              <span className="date-label">on {new Date(selectedDate).toLocaleDateString()}</span>
            </div>
            <div className="metric-card">
              <h3>Dinner Orders</h3>
              <p>{dinnerOrders}</p>
              <div className="food-type-counts">
                <div className="veg-count">
                  <span>Veg: {dinnerVegOrders}</span>
                  <div className="portion-counts">
                    <span className="half-count">Half: {dinnerVegHalfOrders}</span>
                    <span className="full-count">Full: {dinnerVegFullOrders}</span>
                  </div>
                </div>
                <div className="non-veg-count">
                  <span>Non-veg: {dinnerNonVegOrders}</span>
                  <div className="portion-counts">
                    <span className="half-count">Half: {dinnerNonVegHalfOrders}</span>
                    <span className="full-count">Full: {dinnerNonVegFullOrders}</span>
                  </div>
                </div>
              </div>
              <span className="date-label">on {new Date(selectedDate).toLocaleDateString()}</span>
            </div>
          </div>
          {error && <p className="error-message">{error}</p>}
        </div>
      </div>
    </div>
  );
};

export default ReportsManagement;
