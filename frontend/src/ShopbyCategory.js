import React from 'react';
import { Box, Typography, Grid } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axiosInstance from './axiosInstance';


function ShopByCategory() {

  const navigate = useNavigate();

  const handleCategoryClick = async (category) => {
    try {
      // Make an API call to fetch data based on the category
      const response = await axiosInstance.get(`/collection/${category}`);
      
      // Handle the API response (you could pass the response data via state or context if needed)
      console.log('API Response:', response.data);

      // Navigate to the collection page
      navigate(`/collections/${category}`, { state: { data: response.data } });
    } catch (error) {
      console.error(`Error fetching data for ${category}:`, error);
    }
  };

  return (
    <Box>
      {/* Heading */}
      <Typography variant="h3" sx={{ textAlign: 'center', marginTop: '20px', color: '#51744B', fontFamily: "Playfair Display" }}>
        SHOP BY CATEGORY
      </Typography>

      {/* Grid for Images */}
      <Grid container spacing={2} justifyContent="center" p={4}>
        {/* Image 1 */}
        <Grid item xs={12} sm={6} md={3}>
          <Box sx={{ textAlign: 'center' }}>
            <img
              src="/images/ShopByCategory/Tea.webp"
              alt="Tea"
              style={{ width: '100%', borderRadius: '200px', cursor: 'pointer' }}
              onClick={() => handleCategoryClick('teas')}
            />
            <Typography variant="h5" sx={{ marginTop: '10px', color: '#51744B' }}>Tea</Typography>
          </Box>
        </Grid>

        {/* Image 2 */}
        <Grid item xs={12} sm={6} md={3} >
          <Box sx={{ textAlign: 'center' }}>
            <img
              src="/images/ShopByCategory/TeaLeaves.webp"
              alt="Tea Leaves"
              style={{ width: '100%', borderRadius: '200px', cursor: 'pointer'  }}
              onClick={() => handleCategoryClick('tealeaves')}
            />
            <Typography variant="h5" sx={{ marginTop: '10px', color: '#51744B'}}>Tea Leaves</Typography>
          </Box>
        </Grid>

        {/* Image 3 */}
        <Grid item xs={12} sm={6} md={3}>
          <Box sx={{ textAlign: 'center' }}>
            <img
              src="/images/ShopByCategory/Snacks.webp"
              alt="Snacks"
              style={{ width: '100%', borderRadius: '200px', cursor: 'pointer' }}
              onClick={() => handleCategoryClick('snacks')}
            />
            <Typography variant="h5" sx={{ marginTop: '10px', color: '#51744B'}}>Snacks</Typography>
          </Box>
        </Grid>

        {/* Image 4 */}
        <Grid item xs={12} sm={6} md={3}>
          <Box sx={{ textAlign: 'center', cursor: 'pointer' }}>
            <img
              src="/images/ShopByCategory/Teaware.webp"
              alt="Teaware"
              style={{ width: '100%', borderRadius: '200px', cursor: 'pointer' }}
              onClick={() => handleCategoryClick('teaware')}
            />
            <Typography variant="h5" sx={{ marginTop: '10px', color: '#51744B'}}>Teaware</Typography>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}

export default ShopByCategory;
