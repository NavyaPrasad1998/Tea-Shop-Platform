import React from 'react';
import { Box, Typography, Grid } from '@mui/material';

const Recommendations = ({ recommendations }) => {
  // Hardcode to display only the first 5 items
  const visibleItems = recommendations.slice(0, 5);

  return (
    <Grid container sx={{ justifyContent: 'center', alignItems: 'center' }}>
      {visibleItems.map((item) => (
        <Grid item xs={2.4} key={item.id}>
           <Box sx={{ textAlign: 'center' }}>
                              <img
                              src={item.image_url}
                              alt={item.name}
                              style={{ width: '80%', borderRadius: '16px', cursor: 'pointer' }}
                              
                              />
            <Typography sx={{fontSize: '24px', marginBottom: '20px', color: '#51744B', fontFamily: "Playfair Display"}}>{item.name}</Typography>
          </Box>
        </Grid>
      ))}
    </Grid>
  );
};

export default Recommendations;
