import React, {useEffect} from 'react';
import HeaderStrip from './HeaderStrip';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { Box, Typography, Grid } from '@mui/material';
import axiosInstance from './axiosInstance';

function Search({ handleCartOpen, cartItems, isLoggedIn, user }) {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const query = queryParams.get('q'); // Extract the search query from the URL
    const data = location.state?.data || []; 
    const navigate = useNavigate();

    console.log("data in collections:",data)

    useEffect(() => {
        // Scroll to the top when the component is rendered or location changes
        window.scrollTo(0, 0);
      }, [location]);


    const handleProductClick = async (product) => {
        try {
          // Make an API call with the product_id
          const response = await axiosInstance.get(`/products/${product.product_id}`);
          const formattedName = product.name.toLowerCase().replace(/\s+/g, '-');
          // Navigate to the product page with a query parameter
          navigate(`/products/${formattedName}?variant=${product.product_id}`, {
            state: { data: response.data }, // Pass the response data to the product page
          });
        } catch (error) {
          console.error('Error fetching product details:', error);
        }
      };

    return(
        <>
            <HeaderStrip handleCartOpen={handleCartOpen} cartItems={cartItems} isLoggedIn={isLoggedIn} user={user}/>
            <div>
            <Typography variant="h3" sx={{ textAlign: 'center', marginTop: '20px', color: '#51744B', fontFamily: "Playfair Display" }}>Found <span style={{marginTop: '-5px'}}>{data.length}</span> items for your search "{query.replace('+', ' ')}"</Typography>
            <Grid container spacing={3} sx={{ marginTop: '20px', padding: '0 20px' }}>
                {data && data.length > 0 ? (
                data.map((item) => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={item.product_id}>
                    <div
                        style={{
                        border: '1px solid #ccc',
                        borderRadius: '8px',
                        padding: '10px',
                        textAlign: 'center',
                        cursor: 'ponter'
                        }}
                       
                    >
                        <img
                        src={item.image_url}
                        alt={item.name}
                        style={{
                            width: '100%',
                            height: '350px',
                            borderRadius: '8px',
                            marginBottom: '10px',
                            cursor: 'pointer'
                        }}
                        onClick={() => handleProductClick(item)}
                        />
                        <h2 style={{ fontSize: '18px', color: '#51744B' }}>{item.name}</h2>
                        <p>Price: ${item.price.toFixed(2)}</p>
                    </div>
                    </Grid>
                ))
                ) : (
                <Typography variant="body1" sx={{ textAlign: 'center', width: '100%' }}>
                    No products found for "{query.replace('+', ' ')}".
                </Typography>
                )}
            </Grid>
      </div>

        </>
    );
};

export default Search;