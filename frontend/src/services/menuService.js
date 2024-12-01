import axios from 'axios';

const API_URL = 'http://localhost:5002/api/menu';

// Get token from localStorage
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  };
};

// Get all menu items
export const getAllMenuItems = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Add new menu item
export const addMenuItem = async (menuData) => {
  try {
    const response = await axios.post(API_URL, menuData, getAuthHeader());
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Update menu item
export const updateMenuItem = async (id, menuData) => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, menuData, getAuthHeader());
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Delete menu item
export const deleteMenuItem = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/${id}`, getAuthHeader());
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};
