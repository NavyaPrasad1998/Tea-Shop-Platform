import React, {useState} from 'react';
import { IconButton, Box, Paper, TextField, Typography, Badge, MenuItem, Menu, Tooltip } from '@mui/material';
import { GoSearch } from "react-icons/go";
import { FaRegUser } from "react-icons/fa";
import { FaCartShopping } from "react-icons/fa6";
import { useNavigate, useLocation } from 'react-router-dom';
import MenuList from './MenuList';
import axiosInstance from './axiosInstance';

function HeaderStrip({handleCartOpen, cartItems = [], isLoggedIn, user }){
    const [searchQuery, setSearchQuery] = useState('');
    
    const navigate = useNavigate();
    const location = useLocation();

    // console.log("cartItems",cartItems)

    // Ensure itemCount is 0 for empty or undefined cartItems
    const itemCount = Array.isArray(cartItems)
    ? cartItems.reduce((total, item) => total + item.quantity, 0)
    : 0;

    const handleUserIconClick = (event) => {
        if (!isLoggedIn) {
         // Save the current location and state to sessionStorage
          const stateToSave = {
            from: `${location.pathname}${location.search}`,
            data: location.state?.data || null, // Save the necessary data
          };
          sessionStorage.setItem('redirectState', JSON.stringify(stateToSave));
      
          // Navigate to the login page
          navigate('/account/login');
        } else {
          // Open the menu for logged-in users
          navigate('/account/profile');
        }
    };
    

    const handleSearch = async () => {
            const formattedCategory = searchQuery.toLowerCase().replace(/\s+/g, '+');
            try {
                // Make an API call to fetch data for the selected category
                const response = await axiosInstance.get(`/search?q=${formattedCategory}`);
                
                // console.log("response:",response)
                // Ensure the data is always an array
                const data = Array.isArray(response.data) ? response.data : [response.data];
    
                // Navigate to /collections/{category} with the API response data
                navigate(`/search?q=${formattedCategory}`, { state: { data } });
            } catch (error) {
                if (error.response?.status === 404){
                    navigate(`/search?q=${formattedCategory}`, { state: { data: [] } });
                }
                console.error(`Error fetching data for category ${searchQuery}:`, error);
            }
    }


    return(
        <div>
            {/* Limited Offer Strip */}
            <div className="limited-offer">
                Limited Offer: Get 50% off on your first order!
            </div>

            {/* Logo, Menu, and Icons Strip */}
            <Box className='header-strip'>
                {/* Logo */}
                <Box className="logo" sx={{ fontWeight: 'bold', fontSize: '18px', width: '500px' }}>
                    <img 
                        src="/images/logo-transparent-png.png" alt="Logo" 
                        style={{ height: '200px', width: 'auto', marginLeft: '-100px', cursor: 'pointer' }}
                        onClick={() => navigate('/')} />
                </Box>
                {/* Search Box */}
                <TextField
                    fullWidth
                    placeholder="Search our store"
                    size='small'
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    InputProps={{
                        endAdornment: (
                            <IconButton onClick={handleSearch}>
                                <GoSearch />
                            </IconButton>
                        ),
                        style: {
                            borderRadius: '8px',
                            backgroundColor: '#fff',
                        },
                    }}
                    sx={{
                        maxWidth: '600px',
                        marginLeft: '-100px'
                    }}
                />


                {/* Icons */}
                <Box className="icons">
                    {/* Tooltip with dynamic content */}
                    <Tooltip  
                        title={
                            isLoggedIn ? (
                            <div style={{ fontSize: '16px', textAlign: 'center' }}>
                                Hi, {user.name}!
                                <br />
                                Click to view your Profile
                            </div>
                            ) : (
                            <div style={{ fontSize: '16px', textAlign: 'center' }}>
                                Hey, Tea Lover!
                                <br />
                                Click to Login / Sign Up
                            </div>
                            )
                        }
                        placement="top"
                        >
                        <IconButton onClick={handleUserIconClick}>
                            <FaRegUser />
                        </IconButton>
                    </Tooltip>
                    <IconButton onClick={handleCartOpen}>
                        <Badge badgeContent={itemCount} color="secondary">
                            <FaCartShopping />
                        </Badge>
                    </IconButton>
                </Box>
            </Box>
            <MenuList/>
        </div>
    )
};

export default HeaderStrip;