import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, TextField, Typography, IconButton, Button, Snackbar, Alert } from '@mui/material';
import { FaEdit } from "react-icons/fa";
import HeaderStrip from './HeaderStrip';
import { FaCircleUser } from "react-icons/fa6";
import { CiEdit } from "react-icons/ci";
import { FaUserEdit } from "react-icons/fa";
import axiosInstance from './axiosInstance';
import { useNavigate } from 'react-router-dom';

function ProfilePage({ handleCartOpen, cartItems, isLoggedIn, user, setIsLoggedIn, setUser, setCartItems }) {
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone_number: '',
    shipping_address: '',
  });

  const [editable, setEditable] = useState(false); // Tracks if fields are editable
  const [error, setError] = useState({ phone_number: false });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: '' });
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch profile data on component mount
    const fetchProfileData = async () => {
      try {
        const response = await axiosInstance.get('/profile', { 
            params: { email: user.email }, // Pass email as a query parameter
            headers: { 'Content-Type': 'application/json' },
        });
        setProfileData(response.data);
      } catch (error) {
        console.error('Error fetching profile data:', error);
      }
    };

    if (user?.email) {
      fetchProfileData();
    }
  }, [user]);

  const handleEditClick = () => {
    setEditable(true); // Enable editing
  };

  const handleUpdateClick = async () => {
    try {
       // Validate required fields
        if (!profileData.name || !profileData.phone_number || !profileData.shipping_address) {
            setSnackbar({
            open: true,
            message: 'Please fill in all fields before updating your profile.',
            severity: 'error',
            });
            return;
        }
  
      // Send PUT request to the backend with updated profile data
      const response = await axiosInstance.put('/profile', {
        email: profileData.email, // Ensure email is included in the request
        name: profileData.name,
        phone_number: profileData.phone_number,
        shipping_address: profileData.shipping_address,
      });
  
      if (response.status === 200) {
        setSnackbar({
            open: true,
            message: response.data.message || 'Profile updated successfully!',
            severity: 'success',
          });
        setEditable(false); // Disable editing after successful update
      } else {
        setSnackbar({
            open: true,
            message: 'Unexpected response. Please try again.',
            severity: 'error',
          });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
  
      // Display error message
      const errorMessage = error.response?.data?.message || 'Failed to update profile. Please try again.';
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error',
      });
    }
  };

  const handleChange = (field, value) => {
    if (field === 'name' && !value.trim()) {
        setError((prev) => ({ ...prev, [field]: true })); // Set error if empty
      } else if (field === 'name') {
        setError((prev) => ({ ...prev, [field]: false })); // Clear error if valid
      }

    if (field === 'phone_number') {
        if (!/^\d*$/.test(value)) {
          setError((prev) => ({ ...prev, [field]: true })); // Set error if non-numeric
          return;
        } else if (field === 'phone_number' && !value.trim()) {
            setError((prev) => ({ ...prev, [field]: true }))
        } else {
          setError((prev) => ({ ...prev, [field]: false })); // Clear error if valid
        }
      }

      if (field === 'shipping_address' && !value.trim()) {
        setError((prev) => ({ ...prev, [field]: true })); // Set error if empty
      } else if (field === 'shipping_address') {
        setError((prev) => ({ ...prev, [field]: false })); // Clear error if valid
      }

    setProfileData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUser(null);
    setCartItems([]);
    navigate('/');
  }


  return (
    <>
      <HeaderStrip handleCartOpen={handleCartOpen} cartItems={cartItems} isLoggedIn={isLoggedIn} user={user}/>
      <Box sx={{ maxWidth: '600px', margin: '20px auto', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
        <Typography variant="h4" sx={{ marginBottom: '20px', textAlign: 'center', fontFamily: 'Playfair Display', color: "#51744B" }}>
            Profile Information
        <IconButton onClick={handleEditClick} sx={{ position:'absolute', marginLeft: '125px', marginTop: '-10px', color: '#097969' }}>
            <FaUserEdit />
          </IconButton>
        </Typography>
        


        <div style={{textAlign: 'center', fontSize: '100px', color: '#088F8F'}}><FaCircleUser/></div>

        {/* Name */}
        <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
          <TextField
            label="Name"
            value={profileData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            disabled={!editable}
            fullWidth
            variant="outlined"
            error={error.name} // Show error state
            helperText={error.name ? "Name cannot be empty" : ""} // Error messag
          />
        </Box>

        {/* Email */}
        <TextField
          label="Email"
          value={profileData.email}
          onChange={(e) => handleChange('email', e.target.value)}
          disabled
          fullWidth
          variant="outlined"
          sx={{ marginBottom: '20px' }}
        />

        {/* Phone */}
        <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
          <TextField
            label="Phone"
            value={profileData.phone_number}
            onChange={(e) => handleChange('phone_number', e.target.value)}
            disabled={!editable}
            fullWidth
            variant="outlined"
            error={error.phone_number} // Show error state
            helperText={error.phone_number ? "Enter a valid phone number" : ""} // Error message
          />
        </Box>

        {/* Shipping Address */}
        <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
          <TextField
            label="Shipping Address"
            value={profileData.shipping_address}
            onChange={(e) => handleChange('shipping_address', e.target.value)}
            disabled={!editable}
            fullWidth
            variant="outlined"
            error={error.shipping_address} // Show error state
            helperText={error.shipping_address ? "Address cannot be empty" : ""}
          />
        </Box>

        {/* Update Button */}
        {editable && (
          <Button
            variant="contained"
            color="primary"
            onClick={handleUpdateClick}
            fullWidth
            sx={{ marginTop: '20px' }}
          >
            Update Profile
          </Button>
        )}
        <Button
            variant="contained"
            color="error"
            onClick={handleLogout}
            fullWidth
            sx={{ marginTop: '20px' }}
          >
            Log Out
          </Button>

          {/* Snackbar */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert
                onClose={handleCloseSnackbar}
                severity={snackbar.severity}
                sx={{ width: '100%' }}
                >
                {snackbar.message}
                </Alert>
            </Snackbar>

      </Box>
    </>
  );
}

export default ProfilePage;
