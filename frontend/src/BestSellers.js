import React, {useState, useEffect} from 'react';
import { Box, Typography, Grid } from '@mui/material';
import axiosInstance from './axiosInstance';
import { useNavigate } from 'react-router-dom';

function BestSellers() {

    const [products, setProducts] = useState([]);
    const navigate = useNavigate();

     // Fetch data from the API
    useEffect(() => {
        const fetchProducts = async () => {
        try {
            const response = await axiosInstance.get('best-sellers/top');
            console.log("response:",response)
            setProducts(response.data);
        } catch (error) {
            console.error('Error fetching products:', error);
        }
        };

        fetchProducts();

    }, []);

    console.log("products:",products)

    const handleItemClick = async (product) => {
      try {
        const response = await axiosInstance.get(`/products/${product.product_id}`);
        const formattedName = product.name.toLowerCase().replace(/\s+/g, '-');
        
        navigate(`/products/${formattedName}?variant=${product.product_id}`, {
          state: { data: response.data }, // Pass the response data to the product page
        });
      } catch (error) {
        console.error('Error fetching product details:', error);
      }
    };

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
                    style={{ width: '100%', borderRadius: '200px', cursor: 'pointer' }}
                    onClick={() => handleItemClick(product)}
                    />
                    <Typography variant="h5" sx={{ marginTop: '10px', color: '#51744B' }}>{product.name}</Typography>
                    <Typography sx={{fontFamily: 'Work Sans'}}>${product.price.toFixed(2)}</Typography>
                </Box>
            </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default BestSellers;
