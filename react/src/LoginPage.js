import React, {useState} from 'react';
import { Box, TextField, Button, Typography, Link, Alert } from '@mui/material';
import Logo from './assets/logo-png.png';
import axios from 'axios';
import { Link as RouterLink } from 'react-router-dom';
import './css/LoginPage.css'

function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState(false);

    const handleLogin = async () => {
        try {
            const response = await axios.post('http://127.0.0.1:5000/login', { email, password });
            console.log('response:',response)
            setMessage(response.data.message);
            setError(false);
        } catch (err) {
            setMessage(err.response?.data?.message || 'Something went wrong');
            setError(true);
        }
    };

    return (
        <Box className="login-container">
            <Box className="login-box">
                <img src={Logo} style={{height: '200px'}} alt="Logo" className="login-logo" />
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
                <Button
                    fullWidth
                    variant="contained"
                    color="primary"
                    style={{ marginTop: '10px', width: '100px' }}
                    onClick={handleLogin}
                >
                    Sign In
                </Button>
                <Typography variant="body2" style={{ marginTop: '10px' }}>
                    Don't have an account?{' '}
                    <Link component={RouterLink} to="/account/register" underline="hover">
                        Sign Up
                    </Link>
                </Typography>
            </Box>
        </Box>
    );
}

export default LoginPage;
