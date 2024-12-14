import React, {useState} from 'react';
import { IconButton, Box, Paper, TextField, Typography, Badge, MenuItem, Menu, Tooltip } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axiosInstance from './axiosInstance';

function MenuList(){
    
    const [showDropdown, setShowDropdown] = useState(false);
    const navigate = useNavigate();
    
    const handleMouseEnter = () => {
        setShowDropdown(true);
    };

    const handleMouseLeave = () => {
        setShowDropdown(false);
    };
    const handleCategoryClick = async (category) => {
        if(category === 'about'){
            navigate('/about');
        } else {
        console.log('category:',category)
        const formattedCategory = category.toLowerCase().replace(/\s+/g, '-'); // Convert to lowercase and remove spaces
    
        try {
            // Make an API call to fetch data for the selected category
            const response = await axiosInstance.get(`/collection/${formattedCategory}`);
            
            // console.log("response:",response)
            // Ensure the data is always an array
            const data = Array.isArray(response.data) ? response.data : [response.data];

            // Navigate to /collections/{category} with the API response data
            navigate(`/collections/${formattedCategory}`, { state: { data } });
        } catch (error) {
            if (error.response?.status === 404){
                navigate(`/collections/${formattedCategory}`, { state: { data: [] } });
            }
            console.error(`Error fetching data for category ${category}:`, error);
        }
    }
    };
    
    const dropdownData = [
        {
            heading: 'Tea by Type',
            items: [
            { label: 'Wellness Tea' },
            { label: 'Green Tea' },
            { label: 'Herbal Tea' },
            { label: 'Black Tea' },
            { label: 'White Tea' },
            { label: 'Iced Tea' },
            ],
        },
        {
            heading: 'Tea by Concern',
            items: [
            { label: 'Digestive Health' },
            { label: 'Weight Loss' },
            { label: 'Sleep & Stress' },
            { label: 'Kickstart Mornings' },
            { label: 'Body Healing' },
            ],
        },
        {
            heading: 'Tea by Flavour',
            items: [
            { label: 'Kahwa' },
            { label: 'Mint' },
            { label: 'Chamomile' },
            { label: 'Floral' },
            { label: 'Herbal' },
            { label: 'Unflavoured' },
            ],
        },
    ];


    return(
        <div style={{padding: '8px'}}>
            <Box
                sx={{
                    display: 'flex',
                    gap: '40px',
                    flex: '1',
                    justifyContent: 'center',
                    fontSize: '20px'
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
                        onClick={() => handleCategoryClick("teas")}
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
                            <Box className="dropdown-row">
                                {dropdownData.map((section) => (
                                <Box key={section.heading} className="dropdown-section">
                                    <Box className="dropdown-heading">{section.heading}</Box>
                                    <Box className="dropdown-divider"></Box>
                                    <Box className="dropdown-items">
                                    {section.items.map((item) => (
                                        <Box
                                        key={item.label}
                                        className="dropdown-link"
                                        onClick={() => handleCategoryClick(item.label)} // Call the function with the label
                                        sx={{
                                            cursor: 'pointer',
                                            '&:hover': { color: '#954535', textDecoration: 'underline' },
                                        }}
                                        >
                                        {item.label}
                                        </Box>
                                    ))}
                                    </Box>
                                </Box>
                                ))}
                            </Box>
                        </Box>
                    </Paper>
                    )}
                </Box>

                {/* Other Menu Items */}
                {['Teaware', 'Snacks', 'Tea Leaves'].map((item) => (
                    <Box
                        key={item}
                        onClick={() => handleCategoryClick(item)}
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
                    <Box
                        onClick={() => handleCategoryClick("about")}
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
                      About
                    </Box>
            </Box>
        </div>
    );
};

export default MenuList;