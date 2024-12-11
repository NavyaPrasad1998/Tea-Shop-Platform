import React, {useState, useEffect} from 'react';
import { Box, Typography, Grid } from '@mui/material';
import axios from 'axios';


function BestSellers() {

    const [products, setProducts] = useState([]);
     // Fetch data from the API
    useEffect(() => {
        const fetchProducts = async () => {
        try {
            const response = await axios.get('http://127.0.0.1:5000/best-sellers/top');
            console.log("response:",response)
            setProducts(response.data);
        } catch (error) {
            console.error('Error fetching products:', error);
        }
        };

        fetchProducts();

    }, []);

    console.log("products:",products)
    const handleCategoryClick = () => {
        
    }
  return (
    <Box>
      {/* Heading */}
      <Typography variant="h3" sx={{ textAlign: 'center', marginTop: '20px', color: '#51744B', fontFamily: "Playfair Display" }}>BEST-SELLERS</Typography>

      {/* Grid for Images */}
      <Grid container spacing={2} justifyContent="center" p={4}>
        {products && products.length>0 && products.map((product) => (
            <Grid item xs={12} sm={6} md={3} key={product.product_id}>
                <Box sx={{ textAlign: 'center' }}>
                    <img
                    src={product.image_url}
                    alt={product.name}
                    style={{ width: '100%', borderRadius: '200px' }}
                    />
                    <Typography variant="h5" sx={{ marginTop: '10px', color: '#51744B' }}>{product.name}</Typography>
                    <Typography sx={{fontFamily: 'Work Sans'}}>${product.price.toFixed(2)}</Typography>
                </Box>
            </Grid>
        ))}
      </Grid>
    </Box>
  );
}

export default BestSellers;
