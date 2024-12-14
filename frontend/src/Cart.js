import React, {useState,useEffect} from 'react';
import { Drawer, Box, Typography, IconButton, Button, Grid } from '@mui/material';
import { IoClose } from 'react-icons/io5';
import { FaPlus, FaMinus } from 'react-icons/fa6';
import { AiTwotoneDelete } from "react-icons/ai";
import axiosInstance from './axiosInstance';
import { useNavigate } from 'react-router-dom';

function Cart({ open, onClose, cartItems, updateCartItem, removeCartItem, isLoggedIn, user }) {

    const [products, setProducts] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        if (cartItems.length === 0 && products.length === 0) {
          const fetchProducts = async () => {
            try {
              const response = await axiosInstance.get('/best-sellers/top');
              setProducts(response.data);
            } catch (error) {
              console.error('Error fetching products:', error);
            }
          };
    
          fetchProducts();
        }
      }, [cartItems, products]);

      const handleSearchAllTeas = async () => {
        try {

            const response = await axiosInstance.get('/collection/teas');
            
            const data = Array.isArray(response.data) ? response.data : [response.data];

            navigate('/collections/teas', { state: { data } });
            onClose();
        } catch (error) {
            if (error.response?.status === 404){
                navigate('/collections/teas', { state: { data: [] } });
            }
            console.error('Error fetching data for all teas:', error);
        }
      };

      const bestSellerClick = async (product) => {
        try {
          const response = await axiosInstance.get(`/products/${product.product_id}`);
          const formattedName = product.name.toLowerCase().replace(/\s+/g, '-');
          
          navigate(`/products/${formattedName}?variant=${product.product_id}`, {
            state: { data: response.data }, // Pass the response data to the product page
          });
          onClose();
        } catch (error) {
          console.error('Error fetching product details:', error);
        }
      };

      const handleCartUpdate = async (product_id, quantity) => {
        if(isLoggedIn && user){
            try {
                const cartData = {
                    user_id: user.user_id,
                    product_id: product_id,
                    quantity: quantity,
                  };
                  console.log("cartData:",cartData)
                  const response = await axiosInstance.post('/cart/add', cartData);
                  console.log('response:',response)
                  
            } catch (error) {
                console.log("Failed to update cart items to database:",error);
            } finally {
                updateCartItem(product_id, quantity)
            }
        } else {
            updateCartItem(product_id, quantity)
        }
      };

      const handleCartRemove = async (product_id) => {
        if(isLoggedIn && user){
            try {
                 // Fetch the cart items for the logged-in user
                const cartResponse = await axiosInstance.get(`/cart/${user.user_id}`);
                const cartItems = cartResponse.data.items;

                console.log("cartItems:",cartItems)

                // Find the cart item that matches the given product_id
                const cartItem = cartItems.find((item) => item.product_id === product_id);

                if (cartItem) {
                    // Call the remove API with the cart_item_id
                    await axiosInstance.delete(`/cart/remove`, {
                    data: { cart_item_id: cartItem.cart_item_id }, // Pass cart_item_id in the request body
                    });
                    console.log(`Product with ID ${product_id} removed from the cart.`);
                } else {
                    console.warn(`No cart item found with product ID: ${product_id}`);
                }
                  
            } catch (error) {
                console.error('Error removing product from cart:', error);
            } finally {
                removeCartItem(product_id)
            }
        } else {
            removeCartItem(product_id)
        }
      };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      sx={{
        '& .MuiDrawer-paper': {
          width: '400px',
          padding: '20px',
          boxSizing: 'border-box',
        },
      }}
    >
      <Box>
        {/* Close Button */}
        <IconButton
          onClick={onClose}
          sx={{ position: 'absolute', top: '10px', right: '10px' }}
        >
          <IoClose size={24} />
        </IconButton>

        <Typography variant="h4" sx={{ marginBottom: '20px', textAlign: 'center', color: '#51744B', fontFamily: "Playfair Display", textTransform: 'capitalize', fontWeight: '600' }}>
          Your Cart
        </Typography>

        {cartItems.length > 0 ? (
          cartItems.map((item, index) => (
            <Box
              key={index}
              sx={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '15px',
                borderBottom: '1px solid #ccc',
                paddingBottom: '10px',
              }}
            >
              {/* Product Image */}
              <img
                src={item.image_url}
                alt={item.name}
                style={{
                  width: '80px',
                  height: '80px',
                  objectFit: 'cover',
                  borderRadius: '8px',
                  marginRight: '15px',
                }}
              />

              {/* Product Details */}
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" sx={{ marginTop: '10px' }}>
                  {item.name}
                </Typography>
                <Typography variant="body1" sx={{ color: '#51744B' }}>
                  ${item.price.toFixed(2)}
                </Typography>
                {/* Quantity Controls */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
                  <IconButton onClick={() => handleCartUpdate(item.product_id, -1)}>
                    <FaMinus />
                  </IconButton>
                  <Typography>{item.quantity}</Typography>
                  <IconButton onClick={() => handleCartUpdate(item.product_id, 1)}>
                    <FaPlus />
                  </IconButton>
                  <IconButton onClick={() => handleCartRemove(item.product_id)}>
                    <AiTwotoneDelete />
                  </IconButton>
                </Box>
              </Box>
            </Box>
          ))
        ) : (
            <div>
            <Typography  sx={{ textAlign: 'center', color: '#51744B', fontSize: '18px', fontFamily: "Playfair Display", marginTop: '10px'}}>
                Your cart is empty!! 
            </Typography>
            <Typography  sx={{ textAlign: 'center', color: '#51744B', fontSize: '24px', fontFamily: "Playfair Display", marginTop: '30px'}}>
                Shop our best sellers
            </Typography>
            <Grid container spacing={2} justifyContent="center" p={4}>
                {products && products.length>0 && products.map((product) => (
                    <Grid item xs={12} sm={6} md={6} key={product.product_id}>
                        <Box sx={{ textAlign: 'center' }}>
                            <img
                            src={product.image_url}
                            alt={product.name}
                            style={{ width: '100%', borderRadius: '200px', cursor: 'pointer' }}
                            onClick={() => bestSellerClick(product)}
                            />
                            <Typography sx={{ fontSize: '16px', marginTop: '5px', marginBottom: '10px', color: '#51744B', fontFamily: "Playfair Display" }}>{product.name}</Typography>
                        </Box>
                    </Grid>
                ))}
            </Grid>
            <Box sx={{ marginTop: '20px', textAlign: 'center'}}>
            <Button
                variant="contained"
                onClick={handleSearchAllTeas}
                sx={{
                    width: '250px',
                    fontSize: '18px',
                    backgroundColor: '#954535', // Change to desired color
                    color: '#ffffff', // Text color
                    '&:hover': {
                    backgroundColor: '#732d2d', // Hover color
                    },
                }}
                >
                Shop all Teas
            </Button>
          </Box>
        </div>
        )}
        {cartItems.length > 0 && (
          <Box sx={{ marginTop: '20px', textAlign: 'center' }}>
            <Button variant="contained" color="primary">
              Proceed to Checkout
            </Button>
          </Box>
        )}
      </Box>
    </Drawer>
  );
}

export default Cart;
