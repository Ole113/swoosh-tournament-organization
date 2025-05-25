import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // backend API URL from environment variables
});

export default apiClient;
