import axios from 'axios';
import API_BASE_URL from './apiConfig';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 5000, // Optional timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

export default axiosInstance;
