import React, {useState} from 'react';
import { Box, TextField, Button, Typography, Link, Alert } from '@mui/material';
import Logo from './assets/logo-png.png';
import { useNavigate } from 'react-router-dom';
import { Link as RouterLink } from 'react-router-dom';
import axios from 'axios';
import './css/LoginPage.css'

function RegisterPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        phone_number: '',
        shipping_address: '',
    });
    const [message, setMessage] = useState('');
    const [error, setError] = useState(false);
    const navigate = useNavigate();

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleRegister = async () => {
        try {
            console.log("formData:",formData)
            const response = await axios.post('http://127.0.0.1:5000/register', formData);
            console.log("response:",response)
            setMessage(response.data.message);
            setError(false);
            setTimeout(() => navigate('/account/login'), 2000); // Redirect to login after success
        } catch (err) {
            setMessage(err.response?.data?.message || 'Something went wrong');
            setError(true);
        }
    };


    return (
        <Box className="register-container">
            <Box className="register-box">
            <div style={{fontFamily: 'Arial', fontSize: '24px', fontWeight: 'bold', color: '#454B1B'}}>Create Account</div>
                {message && (
                    <Alert severity={error ? 'error' : 'success'} style={{ marginTop: '10px' }}>
                        {message}
                    </Alert>
                )}
                <TextField
                    fullWidth
                    label="Name"
                    name="name"
                    variant="filled"
                    margin="normal"
                    size='small'
                    value={formData.name}
                    onChange={handleInputChange}
                />
                <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    variant="filled"
                    margin="normal"
                    size='small'
                    value={formData.email}
                    onChange={handleInputChange}
                />
                <TextField
                    fullWidth
                    label="Password"
                    type="password"
                    name="password"
                    variant="filled"
                    margin="normal"
                    size='small'
                    value={formData.password}
                    onChange={handleInputChange}
                />
                <TextField
                    fullWidth
                    label="Phone Number"
                    name="phone_number"
                    variant="filled"
                    margin="normal"
                    size='small'
                    value={formData.phone}
                    onChange={handleInputChange}
                />
                <TextField
                    fullWidth
                    label="Shipping Address"
                    name="shipping_address"
                    variant="filled"
                    margin="normal"
                    multiline
                    rows={2}
                    value={formData.address}
                    onChange={handleInputChange}
                />
                <Button
                    fullWidth
                    variant="contained"
                    color="primary"
                    style={{ marginTop: '20px' }}
                    onClick={handleRegister}
                >
                    Create Account
                </Button>
                <Typography variant="body2" style={{ marginTop: '10px' }}>
                    Already have an account?{' '}
                    <Link component={RouterLink} to="/account/login" underline="hover">
                        Log In
                    </Link>
                </Typography>
            </Box>
        </Box>
    );
}

export default RegisterPage;
