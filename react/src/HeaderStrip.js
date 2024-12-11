import React, {useState} from 'react';
import { IconButton, Box, Paper, TextField, Typography } from '@mui/material';
import { GoSearch } from "react-icons/go";
import { FaRegUser } from "react-icons/fa";
import { FaCartShopping } from "react-icons/fa6";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function HeaderStrip(){
    const [showDropdown, setShowDropdown] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoggedIn, setLoggedIn] = useState(false)
    const navigate = useNavigate();

    const handleMouseEnter = () => {
        setShowDropdown(true);
    };

    const handleMouseLeave = () => {
        setShowDropdown(false);
    };

    const handleLogin = () => {
        if(isLoggedIn){
            navigate('/profile')
        }else{
            navigate('/account/login')
        }
    }


    const handleSearch = async () => {
        try {
            const encodedQuery = encodeURIComponent(searchQuery); // Encode the query for URL
            const response = await axios.get(`http://127.0.0.1:5000/search?q=${encodedQuery}`);
            console.log('Search Results:', response.data); // Process the search results
        } catch (error) {
            console.error('Error during search:', error);
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
                <Box className="logo" sx={{ fontWeight: 'bold', fontSize: '18px' }}>
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
                        maxWidth: '500px',
                        marginLeft: '-100px'
                    }}
                />


                {/* Icons */}
                <Box className="icons">
                    <IconButton onClick={handleLogin}>
                        <FaRegUser />
                    </IconButton>
                    <IconButton>
                        <FaCartShopping />
                    </IconButton>
                </Box>
            </Box>

            {/* Menu Items */}
            <div style={{padding: '8px'}}>
            <Box
                    sx={{
                        display: 'flex',
                        gap: '40px',
                        flex: '1',
                        justifyContent: 'center',
                    }}
                >
                    {/* Hoverable Wrapper */}
                    <Box
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={handleMouseLeave}
                        sx={{
                            position: 'relative',
                        }}
                    >
                        {/* Tea Menu Item */}
                        <Box
                            sx={{
                                paddingBottom: '5px',
                                borderBottom: showDropdown ? '2px solid #954535' : '2px solid transparent',
                                color: showDropdown ? '#954535' : 'inherit',
                                cursor: 'pointer',
                                '&:hover': {
                                    color: '#954535',
                                    borderBottom: '2px solid #954535',
                                },
                            }}
                        >
                            Tea
                        </Box>

                        {/* Invisible Hoverable Gap */}
                        {showDropdown && (
                            <Box
                                sx={{
                                    position: 'absolute',
                                    top: '100%',
                                    left: '-50px', // Extend the gap area to the left
                                    width: 'calc(100% + 100px)', // Extend the gap area to the right
                                    height: '50px', // Matches the gap (50% of `top`)
                                    backgroundColor: 'transparent', // Invisible hoverable area
                                }}
                            ></Box>
                        )}

                        {/* Dropdown */}
                        {showDropdown && (
                            <Paper
                            elevation={4}
                            className="dropdown-container"
                        >
                            <Box className="dropdown-content">
                                {/* Row for Headings and Content */}
                                <Box className="dropdown-row">
                                    {/* Tea by Type Section */}
                                    <Box className="dropdown-section">
                                        <Box className="dropdown-heading">Tea by Type</Box>
                                        <Box className="dropdown-divider"></Box>
                                        <Box className="dropdown-items">
                                            <a href="/collections/wellness-tea" className="dropdown-link">Wellness Tea</a>
                                            <a href="/collections/green-tea" className="dropdown-link">Green Tea</a>
                                            <a href="/collections/herbal-tea" className="dropdown-link">Herbal Tea</a>
                                            <a href="/collections/black-tea" className="dropdown-link">Black Tea</a>
                                            <a href="/collections/white-tea" className="dropdown-link">White Tea</a>
                                            <a href="/collections/iced-tea" className="dropdown-link">Iced Tea</a>
                                        </Box>
                                    </Box>
                        
                                    {/* Tea by Concern Section */}
                                    <Box className="dropdown-section">
                                        <Box className="dropdown-heading">Tea by Concern</Box>
                                        <Box className="dropdown-divider"></Box>
                                        <Box className="dropdown-items">
                                            <a href="/digestive-health" className="dropdown-link">Digestive Health</a>
                                            <a href="/weight-loss" className="dropdown-link">Weight Loss</a>
                                            <a href="/sleep-stress" className="dropdown-link">Sleep & Stress</a>
                                            <a href="/kickstart-mornings" className="dropdown-link">Kickstart Mornings</a>
                                            <a href="/body-healing" className="dropdown-link">Body Healing</a>
                                        </Box>
                                    </Box>
                        
                                    {/* Tea by Flavour Section */}
                                    <Box className="dropdown-section">
                                        <Box className="dropdown-heading">Tea by Flavour</Box>
                                        <Box className="dropdown-divider"></Box>
                                        <Box className="dropdown-items">
                                            <a href="/kahwa" className="dropdown-link">Kahwa</a>
                                            <a href="/mint" className="dropdown-link">Mint</a>
                                            <a href="/chamomile" className="dropdown-link">Chamomile</a>
                                            <a href="/floral" className="dropdown-link">Floral</a>
                                            <a href="/herbal" className="dropdown-link">Herbal</a>
                                            <a href="/unflavoured" className="dropdown-link">Unflavoured</a>
                                        </Box>
                                    </Box>
                                </Box>
                            </Box>
                        </Paper>
                        )}
                    </Box>

                    {/* Other Menu Items */}
                    {['Teaware', 'Snacks', 'Loose Leaves', 'About'].map((item) => (
                        <Box
                            key={item}
                            sx={{
                                paddingBottom: '5px',
                                borderBottom: '2px solid transparent',
                                '&:hover': {
                                    color: '#954535',
                                    borderBottom: '2px solid #954535',
                                    cursor: 'pointer',
                                },
                            }}
                        >
                            {item}
                        </Box>
                    ))}
                </Box>
            </div>
        </div>
    )
};

export default HeaderStrip;