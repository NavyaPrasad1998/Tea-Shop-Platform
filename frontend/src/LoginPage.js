import React, {useState} from 'react';
import { Box, TextField, Button, Typography, Link, Alert, Dialog, DialogActions, DialogContent, DialogTitle, Snackbar,CircularProgress } from '@mui/material';
import axios from 'axios';
import { Link as RouterLink, useNavigate, useLocation   } from 'react-router-dom';
import axiosInstance from './axiosInstance';
import './css/LoginPage.css'

function LoginPage({ onLoginSuccess }) {
    const [email, setEmail] = useState('');
    const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState(false);
    const [openForgotPasswordDialog, setOpenForgotPasswordDialog] = useState(false);
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [loading, setLoading] = useState(false); 
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogin = async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.post('/login', { email, password });
            console.log("Login response:", response)
            if (response.status === 200) {
                setMessage(response.data.message);
                setError(false);
                const userDetails = {
                    name: response.data.name,
                    email: email,
                    user_id: response.data.user_id,
                };
                console.log("userDetails:",userDetails)
                onLoginSuccess(userDetails);

                // Retrieve saved state from sessionStorage
                const savedState = JSON.parse(sessionStorage.getItem('redirectState'));
                sessionStorage.removeItem('redirectState'); // Clear the saved state after use

                // Simulate a delay for showing the spinner
                setTimeout(() => {
                  setLoading(false); // Stop spinner
                  // Navigate back to the referring page with the preserved state
                    if (savedState) {
                    navigate(savedState.from, { state: { data: savedState.data } });
                    } else {
                    navigate('/'); // Default to the main landing page
                    }
                }, 1000); // 1-second delay
              } else {
                throw new Error('Unexpected response status');
              }
        } catch (err) {
            setMessage(err.response?.data?.message || 'Something went wrong');
            setError(true);
            setLoading(false);
        }
    };

    // Handle Forgot Password Dialog
    const handleForgotPasswordDialogOpen = () => {
        setOpenForgotPasswordDialog(true);
    };

    const handleForgotPasswordDialogClose = () => {
        setForgotPasswordEmail('')

        setOpenForgotPasswordDialog(false);
    };

    const handleForgotPasswordSubmit = async () => {
        try{
            console.log("forgotPasswordEmail:",forgotPasswordEmail)
            const response = await axios.post('http://localhost:5000/forgot-password', { email: forgotPasswordEmail });
            console.log("response:",response)
            
            setMessage(response.data.message || 'Password reset email sent successfully.');
            setError(false);
            setOpenSnackbar(true); 

        }catch (err) {
            setMessage(err.response?.data?.message || 'Something went wrong');
            setError(true);
            setLoading(false);
        }finally {
            setTimeout(() => {
                setOpenSnackbar(false); 
            }, 3000);
            setOpenSnackbar(true);  
            
            setOpenForgotPasswordDialog(false);  // Close the dialog
        };
    };


    return (
        <Box className="login-container">
            <Box className="login-box">
                <img src="/images/logo-png.png" style={{height: '200px'}} alt="Logo" className="login-logo" />
                <div style={{fontFamily: 'Arial', fontSize: '24px', fontWeight: 'bold', color: '#454B1B'}}>Login</div>
                
                {message && (
                    <Alert severity={error ? 'error' : 'success'} style={{ marginTop: '10px' }}>
                        {message}
                    </Alert>
                )}
                <TextField
                    fullWidth
                    label="Email"
                    variant="filled"
                    margin="normal"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <TextField
                    fullWidth
                    label="Password"
                    type="password"
                    variant="filled"
                    margin="normal"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginTop: '-5px' }}>
                    <Link sx={{ color: 'red', fontSize: '14px', cursor: 'pointer' }} onClick={handleForgotPasswordDialogOpen} underline="hover">
                        Forgot Password?
                    </Link>
                </Box>
                 {/* Show CircularProgress spinner if loading */}
                {loading ? (
                <Box style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
                    <CircularProgress />
                </Box>
                ) : (
                <Button
                    fullWidth
                    variant="contained"
                    color="primary"
                    style={{ marginTop: '10px', width: '100px' }}
                    onClick={handleLogin}
                >
                    Sign In
                </Button>
                )}
                <Typography variant="body2" style={{ marginTop: '10px' }}>
                    Don't have an account?{' '}
                    <Link component={RouterLink} to="/account/register" underline="hover">
                        Sign Up
                    </Link>
                </Typography>
            </Box>

             {/* Forgot Password Dialog */}
            <Dialog 
                open={openForgotPasswordDialog} 
                onClose={handleForgotPasswordDialogClose} 
                sx={{
                '& .MuiDialog-paper': {
                    width: '500px',
                    padding: '12px'
                },
             }}>
                <DialogTitle sx={{textAlign: 'center' , fontFamily: 'Arial', fontSize: '24px', fontWeight: 'bold', color: '#454B1B'}}>Reset Your Password</DialogTitle>
                
                <DialogContent>
                <Typography sx={{ textAlign: 'center', marginBottom: '12px', fontFamily: 'Arial', color: '#454B1B' }}>We will send you an email to reset your password</Typography>
                <TextField
                    fullWidth
                    margin="normal"
                    placeholder='Enter your email address'
                    value={forgotPasswordEmail}
                    onChange={(e) => setForgotPasswordEmail(e.target.value)}
                />
                </DialogContent>
                <DialogActions>
                <Button onClick={handleForgotPasswordDialogClose} color="primary">
                    Cancel
                </Button>
                <Button
                    onClick={handleForgotPasswordSubmit}
                    color="primary"
                    variant="contained"
                    disabled={!forgotPasswordEmail}
                >
                    Submit
                </Button>
                </DialogActions>
            </Dialog>

             {/* Snackbar for Password Reset Message */}
            <Snackbar
                open={openSnackbar} // Open the snackbar when password reset is requested
                autoHideDuration={3000} // Snackbar auto-hides after 3 seconds
                onClose={() => setOpenSnackbar(false)} // Close snackbar on timeout
                anchorOrigin={{
                vertical: 'top',
                horizontal: 'center',
                }}
            >
                <Alert onClose={() => setOpenSnackbar(false)} severity="success" sx={{ width: '100%' }}>
                {message}
                </Alert>
            </Snackbar>
        </Box>
    );
}

export default LoginPage;
