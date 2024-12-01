import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaPlus, FaMinus, FaShoppingCart, FaTrash, FaWallet } from 'react-icons/fa';
import './Menu.css';

const Menu = () => {
  const navigate = useNavigate();
  const [menuItems, setMenuItems] = useState([]);
  const [cart, setCart] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cartVisible, setCartVisible] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
  const [insufficientFunds, setInsufficientFunds] = useState(false);

  // Load cart from localStorage on component mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (err) {
        console.error('Error loading cart:', err);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

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
      console.error('Error fetching wallet balance:', err);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    fetchMenu();
    fetchWalletBalance();
  }, [navigate]);

  const fetchMenu = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5002/api/menu', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const items = response.data;
      
      // Validate menu items have required fields
      const validItems = items.map(item => {
        if (!item.mealType) console.warn(`Menu item ${item._id} missing mealType`);
        if (!item.foodType) console.warn(`Menu item ${item._id} missing foodType`);
        if (!item.portionSize) console.warn(`Menu item ${item._id} missing portionSize`);
        return item;
      });

      setMenuItems(validItems);
      setError(null);
    } catch (error) {
      console.error('Error fetching menu:', error);
      setError('Failed to fetch menu items');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = useCallback(() => {
    return Object.entries(cart).reduce((total, [itemId, quantity]) => {
      const item = menuItems.find(i => i._id === itemId);
      return item ? total + (item.price * quantity) : total;
    }, 0);
  }, [cart, menuItems]);

  const handleQuantityChange = (itemId, change) => {
    setCart(prevCart => {
      const currentQty = prevCart[itemId] || 0;
      const newQty = Math.max(0, currentQty + change);
      
      if (newQty === 0) {
        const { [itemId]: removed, ...rest } = prevCart;
        return rest;
      }
      
      return {
        ...prevCart,
        [itemId]: newQty
      };
    });
  };

  const clearCart = () => {
    setCart({});
    localStorage.removeItem('cart');
  };

  const handlePlaceOrder = async () => {
    try {
      const totalAmount = calculateTotal();
      
      if (totalAmount > walletBalance) {
        setInsufficientFunds(true);
        setTimeout(() => setInsufficientFunds(false), 3000);
        return;
      }

      setLoading(true);
      const token = localStorage.getItem('token');
      const orderItems = Object.keys(cart).map(itemId => ({
        menuItemId: itemId,
        quantity: cart[itemId]
      }));

      const selectedItem = menuItems.find(item => item._id === orderItems[0].menuItemId);
      
      // Place the order
      await axios.post('http://localhost:5002/api/orders', {
        items: orderItems,
        totalAmount,
        mealType: selectedItem.mealType,
        foodType: selectedItem.foodType,
        portionSize: selectedItem.portionSize
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // Deduct amount from wallet
      await axios.post('http://localhost:5002/api/wallet/deduct', {
        amount: totalAmount,
        description: 'Order payment'
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // Update wallet balance in state
      setWalletBalance(prevBalance => prevBalance - totalAmount);

      setOrderSuccess(true);
      clearCart();
      setTimeout(() => {
        setOrderSuccess(false);
        navigate('/member/dashboard');
      }, 2000);

    } catch (error) {
      setError('Failed to place order. Please try again.');
      console.error('Error placing order:', error);
    } finally {
      setLoading(false);
    }
  };

  const getItemQuantity = (itemId) => cart[itemId] || 0;

  const getTotalItems = () => {
    return Object.values(cart).reduce((sum, quantity) => sum + quantity, 0);
  };

  if (loading && !menuItems.length) {
    return <div className="menu-container"><p>Loading menu...</p></div>;
  }

  if (error) {
    return (
      <div className="menu-container">
        <div className="error-message">
          <p>{error}</p>
          <button onClick={fetchMenu}>Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="menu-container">
      {insufficientFunds && (
        <div className="error-popup">
          Insufficient funds! Please add money to your wallet.
        </div>
      )}
      <div className="menu-header">
        <h1>Today's Menu</h1>
        <div className="header-actions">
          <button 
            className="cart-toggle-btn"
            onClick={() => setCartVisible(!cartVisible)}
          >
            <FaShoppingCart />
            {getTotalItems() > 0 && (
              <span className="cart-badge">{getTotalItems()}</span>
            )}
          </button>
          <button className="back-btn" onClick={() => navigate('/member/dashboard')}>
            Back to Dashboard
          </button>
        </div>
      </div>

      {orderSuccess && (
        <div className="success-message">
          Order placed successfully! Redirecting to dashboard...
        </div>
      )}

      <div className="menu-content">
        <div className="menu-list">
          {menuItems.map(item => (
            <div key={item._id} className="menu-card">
              <div className="menu-card-header">
                <h3>{item.dishName}</h3>
                <span className={`food-type-badge ${item.foodType.toLowerCase()}`}>
                  {item.foodType}
                </span>
              </div>
              <div className="menu-card-content">
                <div className="menu-details">
                  <div className="detail-item">
                    <span className="detail-label">Meal Type:</span>
                    <span className={`detail-value meal-type ${item.mealType.toLowerCase()}`}>
                      {item.mealType}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Portion:</span>
                    <span className={`detail-value portion-size ${item.portionSize.toLowerCase()}`}>
                      {item.portionSize}
                    </span>
                  </div>
                </div>
                <div className="price-section">
                  <span className="price-label">Price:</span>
                  <span className="price-value">₹{item.price}</span>
                </div>
              </div>
              <div className="quantity-controls">
                <button 
                  onClick={() => handleQuantityChange(item._id, -1)}
                  disabled={!cart[item._id]}
                  className={`quantity-btn ${!cart[item._id] ? 'disabled' : ''}`}
                  aria-label="Decrease quantity"
                >
                  <FaMinus />
                </button>
                <span className="quantity-display">{getItemQuantity(item._id)}</span>
                <button 
                  onClick={() => handleQuantityChange(item._id, 1)}
                  className="quantity-btn"
                  aria-label="Increase quantity"
                >
                  <FaPlus />
                </button>
              </div>
              {cart[item._id] > 0 && (
                <div className="item-total">
                  Total: ₹{(item.price * cart[item._id]).toFixed(2)}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className={`order-summary ${cartVisible ? 'visible' : ''}`}>
          <div className="order-summary-header">
            <h3>Order Summary</h3>
            <div className="wallet-balance">
              <FaWallet className="wallet-icon" />
              <span>Balance: ₹{walletBalance.toFixed(2)}</span>
            </div>
            {Object.keys(cart).length > 0 && (
              <button className="clear-cart-btn" onClick={clearCart}>
                <FaTrash /> Clear Cart
              </button>
            )}
          </div>
          
          {Object.keys(cart).length === 0 ? (
            <p className="empty-cart-message">Your cart is empty</p>
          ) : (
            <>
              <div className="cart-items">
                {Object.entries(cart).map(([itemId, quantity]) => {
                  const item = menuItems.find(i => i._id === itemId);
                  if (!item) return null;
                  return (
                    <div key={itemId} className="cart-item">
                      <div className="cart-item-details">
                        <span className="item-name">{item.dishName}</span>
                        <span className="item-quantity">x {quantity}</span>
                      </div>
                      <span className="item-total">₹{item.price * quantity}</span>
                    </div>
                  );
                })}
              </div>
              <div className="cart-summary">
                <div className="subtotal">
                  <span>Subtotal</span>
                  <span>₹{calculateTotal()}</span>
                </div>
                <div className="total">
                  <strong>Total</strong>
                  <strong>₹{calculateTotal()}</strong>
                </div>
                <button 
                  className="place-order-btn"
                  onClick={handlePlaceOrder}
                  disabled={loading || Object.keys(cart).length === 0}
                >
                  {loading ? 'Placing Order...' : 'Place Order'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Menu;
