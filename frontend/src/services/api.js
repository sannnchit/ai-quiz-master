import axios from 'axios';
const BASE_URL= import.meta.env.MODE === 'development' ? 'http://localhost:5001/api' : '/api';
const api = axios.create({
  baseURL: 'http://localhost:5001/api', // Your backend server URL
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
