import React, { useState, useEffect } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { Box, Typography, Button, Checkbox, FormControlLabel, TextField } from '@mui/material';
import HeaderStrip from './HeaderStrip';
import RecommendationsStrip from './Recommendations';
import axiosInstance from './axiosInstance';


function ProductPage({ handleAddToCart, handleCartOpen, cartItems, isLoggedIn, user }) {
  const { name } = useParams();
  const location = useLocation();
  const data = location.state?.data;
  const [checked, setChecked] = useState(false); // Checkbox state
  const [quantity, setQuantity] = useState(1); // Quantity state
  const [recommendations, setRecommendations] = useState([]); 
  const [isSubscribed, setSubscriptionStatus] = useState(false);


    useEffect(() => {
        // Scroll to the top when the component is rendered or location changes
        window.scrollTo(0, 0);
    }, [location]);

    useEffect(() => {
        const sendProductViewInfo = async () => {
        try {

            const payload = {
                email: user.email
            }

            const productViewResponse  = await axiosInstance.post(`/view-product/${data.product_id}`, payload);
        
            console.log('Product view recorded successfully::', productViewResponse);
        } catch (error) {
            console.error('Error during subscription:', error);
        }
      };
      if (isLoggedIn && data?.product_id) {
          sendProductViewInfo();
      }
    }, [data?.product_id]);

    useEffect(() => {
        const fetchRecommendations = async () => {
          try {
            if (user?.email) {

              // Make GET request with email as a query parameter
              const response = await axiosInstance.get(`/recommendations`, { 
                params: { email: user.email }
            });
    
              // Store the response in state
              setRecommendations(response.data);
              console.log('Recommendations fetched successfully:', response.data);
            }
          } catch (error) {
            console.error('Error fetching recommendations:', error);
          }
        };
        if (isLoggedIn){
        fetchRecommendations();
        }
      }, [user?.email]);

    
    const handleCheckboxChange = (event) => {
        setChecked(event.target.checked);
    };

    const handleQuantityChange = (event) => {
        setQuantity(event.target.value);
    };

    const handleSubscribe = async () => {
        if(!isSubscribed){
        try {
            const subscriptionDetails = {
                email: user.email,
                product_id: data.product_id,
                frequency: data.category === 'Tea' ? 1 : 14,
                quantity: quantity,
                status: 'active',
            };

            console.log("subscriptionDetails:",subscriptionDetails)
        
            const subscribeResponse = await axiosInstance.post('/subscribe', subscriptionDetails);
        
            console.log('Subscription successful:', subscribeResponse.data);
            setSubscriptionStatus(true)
        } catch (error) {
            console.error('Error during subscription:', error);
        }
      } else {
        try {
            const subscriptionDetails = {
                email: user.email,
                product_id: data.product_id
            };

            console.log("subscriptionDetails:",subscriptionDetails)
        
            const unsubscribeResponse = await axiosInstance.post('/unsubscribe', subscriptionDetails);
        
            console.log('Unsubscription successful:', unsubscribeResponse.data);
            setSubscriptionStatus(false)
        } catch (error) {
            console.error('Error during subscription:', error);
        }
      }
    };

    const handleCartPreProcess = async (product) => {
        if(isLoggedIn && user){
            try {
                const cartData = {
                    user_id: user.user_id,
                    product_id: product.product_id,
                };
                console.log("cartData:",cartData)
                const response = await axiosInstance.post('/cart/add', cartData);
                console.log('response:',response)
                
            } catch (error) {
                console.log("Failed to add cart items to database:",error);
            } finally {
                handleAddToCart(product)
            }
        } else {
            handleAddToCart(product)
        }
    };

  return (
    <>
      <HeaderStrip handleCartOpen={handleCartOpen} cartItems={cartItems} isLoggedIn={isLoggedIn} user={user}/>
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          gap: '20px',
        }}
      >
        {/* Left Side: Product Image */}
        <Box
          sx={{
            flex: '1',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <img
            src={data?.image_url}
            alt={name}
            style={{
              width: '600px',
              height: '600px',
              borderRadius: '8px',
            }}
          />
        </Box>

        {/* Right Side: Product Details */}
        <Box
          sx={{
            flex: '1',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start', // Align items to the top
            gap: '16px', // Reduce spacing between elements
          }}
        >
          {/* Product Name */}
          <Typography sx={{ fontWeight: 'bold', fontSize: '48px', textAlign: 'center', color: '#51744B', fontFamily: 'Times New Roman' }}>
            {data?.name}
          </Typography>

          {/* Product Description */}
          <Typography sx={{ fontWeight: '400', fontSize: '26px', color: '#51744B', fontFamily: 'Times New Roman', marginBottom: '150px'}}>
            {data?.description}
          </Typography>

           {/* Checkbox with Dynamic Label */}
            {data?.category === 'Tea' || data?.category === 'Tea Leaves' ? (
                <div style={{marginTop: '-100px', marginBottom: '100px', minHeight: '200px'}}>
                <FormControlLabel
                sx={{fontSize: '24px'}}
                    control={
                    <Checkbox
                        checked={checked}
                        onChange={handleCheckboxChange}
                        color="primary" 
                        size='normal'
                        sx={{
                            transform: 'scale(1.5)', // Scale the checkbox size
                          }}
                    />
                    }
                    label={
                        <Typography
                          sx={{
                            fontSize: '24px', // Adjust the font size
                            color: '#51744B', 
                            fontFamily: "Playfair Display"
                          }}
                        >
                          {data?.category === 'Tea'
                            ? 'Subscribe to this product daily and save'
                            : 'Subscribe to this product weekly and save'}
                        </Typography>
                      }
                />
                <Typography
                    sx={{
                        fontSize: '18px', // Smaller font for the additional text
                        color: '#51744B', // Match the label color
                        fontFamily: 'Playfair Display',
                        marginTop: '8px', // Add spacing above the text
                    }}
                    >
                    {data?.category === 'Tea'
                        ? 'Start each day with a freshly crafted cup of your favorite tea. Our daily subscription ensures you’ll never miss a moment of comfort and refreshment, with handpicked teas delivered right to your doorstep every single day. Ideal for tea lovers who appreciate a consistent and effortless tea experience.  '
                        : 'Immerse yourself in the rich flavors of premium tea leaves. Choose your preferred quantity and enjoy the convenience of a weekly delivery tailored to your needs. Perfect for those who love brewing their own cup and savoring the unique aroma of freshly steeped leaves. '}
                    </Typography>
                {/* Quantity Input and Subscribe Button */}
            {checked && (
                <Box sx={{ display: 'flex', flexDirection: 'row', gap: '64px', mt: 2 }}>
                <TextField
                    type="number"
                    label="Quantity"
                    value={quantity}
                    onChange={handleQuantityChange}
                    inputProps={{
                        min: 1,
                        style: { height: '24px', padding: '10px' }, // Adjust input element height and padding
                      }}
                      sx={{
                        width: '80px',
                        '& .MuiInputBase-root': {
                          height: '50px', // Set overall height for the text field container
                        },
                      }}
                />
                <Button
                    variant="contained"
                    color="primary"
                    sx={{
                    backgroundColor: '#51744B',
                    '&:hover': { backgroundColor: '#415b37' },
                    fontSize: '20px',
                    height: '50px',
                    width: '200px'
                    }}
                    onClick={handleSubscribe}
                >
                    {!isSubscribed ? 'Subscribe' : 'Unsubscribe'}
                </Button>
                </Box>
            )}
            </div>
        ) : null}

            

          {/* Add to Cart Button */}
          <Button
            variant="contained"
            color="primary"
            sx={{
              backgroundColor: '#51744B',
              '&:hover': { backgroundColor: '#415b37' },
              fontSize: '18px',
            }}
            onClick={() => handleCartPreProcess(data)}
          >
            Add to Cart - ${data?.price.toFixed(2)}
          </Button>
        </Box>
      </Box>
      <Box sx={{ marginTop: '40px', background: '#AFE1AF'}}>
        <Typography variant="h3" sx={{ textAlign: 'center', marginBottom: '24px', color: '#51744B', fontFamily: "Playfair Display" }}>You may also like</Typography>
        <RecommendationsStrip recommendations={recommendations}/>
      </Box>
    </>
  );
}

export default ProductPage;
