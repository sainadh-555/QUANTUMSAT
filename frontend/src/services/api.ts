import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:7860/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getSystemStatus = () => api.get('/system/status').then(res => res.data);
export const getExperiments = () => api.get('/experiments').then(res => res.data);
export const trainClassification = (data: any) => api.post('/classification/train', data).then(res => res.data);

export default api;
