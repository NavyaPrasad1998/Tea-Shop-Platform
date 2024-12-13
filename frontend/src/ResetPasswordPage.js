import React, {useState, useEffect} from 'react';
import { Box, TextField, Button, Alert, CircularProgress  } from '@mui/material';
import axios from 'axios';
import { useNavigate, useParams  } from 'react-router-dom';
import './css/LoginPage.css'

function ResetPasswordPage() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(false);
    const { token } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        // This effect can be used to verify if the token is valid or expired when the page is loaded
        if (!token) {
          setMessage('Invalid or missing token.');
          setError(true);
        }
      }, [token]);

    const handlePasswordChange = async () => {
        // Check if passwords match
        if (password !== confirmPassword) {
          setError(true);
          setMessage('Passwords do not match');
          return;
        }

        console.log("token:",token, "password:",password)
    
        // Set loading state to true (show loader)
        setLoading(true);
        setMessage('Changing password...');
    
        try {
          // Send API request to reset password with the token
          const response = await axios.post('http://127.0.0.1:5000/reset-password', {
            token,
            password
          });

          console.log("response:",response)
    
          // Assuming the API response has a success message    
          if (response.status === 200) {
            setMessage('Password changed successfully');
            setError(false);
            
            // After 1 second delay, redirect to login page
            setTimeout(() => {
              navigate('/account/login');
            }, 2000);
          } else {
            // Handle API error
            setMessage('Failed to change password. Please try again.');
            setError(true);
          }
        } catch (error) {
          console.error('Error changing password:', error);
          setMessage('An error occurred. Please try again.');
          setError(true);
        } finally {
          setLoading(false);
        }
      };

    return (
        <Box className="login-container">
            <Box className="login-box">
                <img src="/images/logo-png.png" style={{height: '200px'}} alt="Logo" className="login-logo" />
                <div style={{fontFamily: 'Arial', fontSize: '24px', fontWeight: 'bold', color: '#454B1B'}}>Reset Your Password</div>
                
                {message && (
                <Alert severity={error ? 'error' : 'success'} style={{ marginTop: '10px' }}>
                    {message}
                </Alert>
                )}

                <TextField
                    fullWidth
                    label="Password"
                    type="password"
                    variant="filled"
                    margin="normal"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                <TextField
                    fullWidth
                    label="Confirm Password"
                    type="password"
                    variant="filled"
                    margin="normal"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)} 
                />
                {/* Show the loader while loading */}
        {loading ? (
          <Box style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
            <CircularProgress /> {/* Material UI loader */}
          </Box>
        ) : (
          <Button
            fullWidth
            variant="contained"
            color="primary"
            style={{ marginTop: '10px' }}
            onClick={handlePasswordChange} // Check passwords and submit
          >
            Change Password
          </Button>
        )}
            </Box>
        </Box>
    );
} 

export default ResetPasswordPage;
