import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLandingPage from './MainLandingPage';
import LoginPage from './LoginPage';
import RegisterPage from './RegisterPage';
import ResetPasswordPage from './ResetPasswordPage';
import Profile from './Profile';
import Collections from './Collections';
import ProductPage from './ProductPage';
import Search from './SearchPage';
import Cart from './Cart';
import AboutPage from './AboutPage';
import axiosInstance from './axiosInstance';
import './App.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Login state
  const [user, setUser] = useState(null); // User's name or email
  const [cartItems, setCartItems] = useState([]); // Shared cart state
  const [cartOpen, setCartOpen] = useState(false); // Drawer state

  // Fetch cart items when user logs in
  useEffect(() => {
    const fetchCartDetails = async () => {
      if (isLoggedIn && user) { // Ensure user is logged in and `user` info is available
        try {
          const cartItemsResponse = await axiosInstance.get(`/cart/${user.user_id}`); // API call
          console.log("cartItemsResponse:",cartItemsResponse)
          if (cartItemsResponse && cartItemsResponse.data) {
            const cartItemsData = cartItemsResponse.data.items; // Assuming response data is an array of cart items
        
            // Fetch product details for each cart item
            const userCartItems = await Promise.all(
              cartItemsData.map(async (cartItem) => {
                try {
                  const productDetailsResponse = await axiosInstance.get(`/products/${cartItem.product_id}`);
                  const productDetails = productDetailsResponse.data;
            
                  // Return the formatted object
                  return {
                    category: productDetails.category,
                    description: productDetails.description,
                    image_url: productDetails.image_url,
                    name: productDetails.name,
                    price: productDetails.price,
                    product_id: productDetails.product_id,
                    stock_quantity: productDetails.stock_quantity,
                    quantity: cartItem.quantity, // Include quantity from cart item
                  };
                } catch (error) {
                  console.error(`Error fetching product details for product ID ${cartItem.product_id}:`, error);
                  return null; // Handle the error by returning null or a fallback structure
                }
              })
            );
            
            setCartItems(userCartItems)
          }
        } catch (error) {
          console.error('Error fetching cart details:', error);
        }
      }
    };

    fetchCartDetails();
  }, [isLoggedIn, user]);

  const handleAddToCart = (product, quantity = 1) => {
    setCartItems((prevCart) => {
      const existingItem = prevCart.find((item) => item.product_id === product.product_id);
      if (existingItem) {
        // Update quantity if the item already exists
        return prevCart.map((item) =>
          item.product_id === product.product_id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      // Add new item to the cart
      return [...prevCart, { ...product, quantity }];
    });
    setCartOpen(true); // Open the cart drawer
  };

  const updateCartItem = (productId, changeValue) => {
    setCartItems((prevCart) =>
      prevCart
        .map((item) =>
          item.product_id === productId
            ? { ...item, quantity: item.quantity + changeValue } // Update the quantity
            : item
        )
        .filter((item) => item.quantity > 0) // Remove items with quantity <= 0
    );
  };

  const handleCartOpen = () => setCartOpen(true);

  const removeCartItem = (productId) => {
    setCartItems((prevCart) => prevCart.filter((item) => item.product_id !== productId));
  };

  const handleLoginSuccess = (userData) => {
    setIsLoggedIn(true);
    setUser(userData);
  };

  console.log("cartItems:",cartItems)

  return (
    <div>
    <Router>
      <Routes>
          <Route 
            path="/" 
            element={
              <MainLandingPage 
              handleCartOpen={handleCartOpen} 
              cartItems={cartItems} 
              isLoggedIn={isLoggedIn}
              user={user} 
            />} 
          />
          <Route path="/account/login" element={<LoginPage onLoginSuccess={handleLoginSuccess}/>} />
          <Route path="/account/register" element={<RegisterPage />} />
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
          <Route path="/account/profile" element={<Profile handleCartOpen={handleCartOpen} cartItems={cartItems} isLoggedIn={isLoggedIn} user={user} setIsLoggedIn={setIsLoggedIn} setUser={setUser} setCartItems={setCartItems} />} />
          <Route path="/collections/:teaType" element={<Collections handleCartOpen={handleCartOpen} cartItems={cartItems} isLoggedIn={isLoggedIn} user={user}/>} />
          <Route path="/search" element={<Search handleCartOpen={handleCartOpen} cartItems={cartItems} isLoggedIn={isLoggedIn} user={user}/>} />
          <Route path="/products/:name" element={<ProductPage handleAddToCart={handleAddToCart} handleCartOpen={handleCartOpen} cartItems={cartItems} isLoggedIn={isLoggedIn} user={user}/>} />
          <Route path="/about" element={<AboutPage handleAddToCart={handleAddToCart} handleCartOpen={handleCartOpen} cartItems={cartItems} isLoggedIn={isLoggedIn} user={user}/>} />
      </Routes>
       {/* Cart Drawer */}
     <Cart
            open={cartOpen}
            onClose={() => setCartOpen(false)}
            cartItems={cartItems}
            updateCartItem={updateCartItem}
            removeCartItem={removeCartItem}
            isLoggedIn={isLoggedIn}
            user={user}
      />
    </Router>
    
    </div>
  );
}

export default App;
