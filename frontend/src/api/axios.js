import axios from 'axios';

const configuredApiURL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL;
const normalizedApiURL = configuredApiURL?.replace(/\/$/, '');
const apiBaseURL = normalizedApiURL
  ? `${normalizedApiURL}${normalizedApiURL.endsWith('/api/v1') ? '' : '/api/v1'}`
  : import.meta.env.DEV
    ? `http://${window.location.hostname}:5000/api/v1`
    : `${window.location.origin}/api/v1`;

const API = axios.create({
  baseURL: apiBaseURL,
  withCredentials: true, // Crucial: Backend cookie transmit karne ke liye
});

export default API;