import axios from 'axios';
const BASE_URL= import.meta.env.MODE === 'development' ? 'http://localhost:5001/api' : '/api';
const api = axios.create({
  baseURL: BASE_URL, // Your backend server URL
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
