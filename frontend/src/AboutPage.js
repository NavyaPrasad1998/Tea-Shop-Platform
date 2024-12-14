import React from 'react';
import { Box, Grid, Typography } from '@mui/material';
import HeaderStrip from './HeaderStrip';

const AboutPage = () => {
  return (
    <>
    <HeaderStrip/>
    <Box sx={{  width: '100vw', height: '100%', overflowX: 'hidden', overflowY: 'auto', padding: 4 }}>
      <Grid container spacing={4} alignItems="center" sx={{ marginBottom: 4 }}>
        <Grid item xs={12} md={6}>
          <Typography variant="h4" sx={{ textAlign: 'center', marginBottom: '10px', color: '#51744B', fontFamily: "Playfair Display" }}>About Tearoma - Our Story</Typography>
          <Typography sx={{fontSize: '22px', fontFamily: 'Playfair Display'}}>
            Welcome to <span style={{fontWeight: 'bold'}}>Tearoma</span>, your ultimate destination for premium teas and a delightful shopping experience. We are passionate about bringing the finest teas from around the world to your cup, creating moments of relaxation and indulgence in your everyday life. Whether you're a tea enthusiast or a casual drinker, Tearoma offers something special for everyone.
 
            At Tearoma, we combine the rich heritage of tea with the innovation of modern technology to create an unmatched online shopping experience. Our platform is built on the foundation of quality, authenticity, and customer satisfaction. From flavorful loose-leaf teas and refreshing blends to beautiful teaware and gourmet snacks, our carefully curated collections are designed to elevate your tea-drinking ritual.
  
            At Tearoma, we believe tea is more than just a beverage; it’s a way to connect, unwind, and savor life’s simple pleasures. Join us on this journey to explore the world of tea and make every sip an extraordinary experience.
          </Typography>
        </Grid>
        <Grid item xs={12} md={6}>
          <Box
            component="img"
            src="/images/aboutPic3.jpg"
            alt="Tea Garden"
            sx={{ width: '90%', borderRadius: 2 }}
          />
        </Grid>
      </Grid>
      <Grid container spacing={4} alignItems="center">
        <Grid item xs={12} md={6}>
          <Box
            component="img"
            src="/images/aboutPic1.jpg"
            alt="Owners"
            sx={{ width: '100%', borderRadius: 2 }}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="h4"  sx={{ textAlign: 'center', marginBottom: '10px', color: '#51744B', fontFamily: "Playfair Display" }}> People Behind Tearoma </Typography>
          <Typography sx={{fontSize: '22px', fontFamily: 'Playfair Display'}}>
            Tearoma was born out of the shared passion for tea and technology by Aditi and Navya, two enthusiastic tea lovers and visionary entrepreneurs. Currently pursuing their Master's degrees at the University of Colorado Boulder, Aditi and Navya combined their academic expertise and love for tea to create a platform that celebrates the art of tea while leveraging the power of modern technology.
 
            As avid tea enthusiasts, the founders have always been fascinated by the culture, history, and endless variety of teas from around the world. They envisioned a space where people could not only explore exceptional teas but also experience the comfort and joy that tea brings to daily life. This vision inspired them to build Tearoma, an online tea store that brings together curated tea collections, innovative shopping features, and a deep sense of community.
  
            Their strong technical backgrounds and dedication to innovation have shaped Tearoma into a state-of-the-art platform. By blending their academic pursuits in technology with their entrepreneurial spirit, Aditi and Navya have created a unique space where tradition meets modern convenience.
  
            For them, Tearoma is more than just a business—it’s a way to share their love for tea with the world and help others discover the beauty and serenity in every cup. Whether you're new to tea or a seasoned connoisseur, Aditi and Navya invite you to join them in their journey to make tea a part of life’s extraordinary moments.
          </Typography>
        </Grid>
      </Grid>
    </Box>
    <Box>
        <Typography variant='h2' sx={{fontWeight: 'bold', textAlign: 'center',color: '#51744B', fontFamily: "Playfair Display", textTransform: 'capitalize' }}>Tearoma – Where every sip tells a story!!</Typography>
    </Box>
    </>
  );
};

export default AboutPage;