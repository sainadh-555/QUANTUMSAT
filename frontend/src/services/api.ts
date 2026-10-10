import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:7860/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 120000, // 2 min for quantum experiments
});

// ── System ──
export const getHealth = () => api.get('/health').then(r => r.data);
export const getSystemStatus = () => api.get('/system/status').then(r => r.data);

// ── Classification ──
export const trainClassical = (data: FormData) =>
  api.post('/classify/train', data, { headers: { 'Content-Type': 'multipart/form-data' } }).then(r => r.data);

export const predictImage = (data: FormData) =>
  api.post('/classify/predict', data, { headers: { 'Content-Type': 'multipart/form-data' } }).then(r => r.data);

export const trainQuantum = (data: FormData) =>
  api.post('/classify/quantum', data, { headers: { 'Content-Type': 'multipart/form-data' } }).then(r => r.data);

export const predictGemini = (data: FormData) =>
  api.post('/classify/gemini', data, { headers: { 'Content-Type': 'multipart/form-data' } }).then(r => r.data);

// ── Change Detection ──
export const compareImages = (data: FormData) =>
  api.post('/change-detection/compare', data, { headers: { 'Content-Type': 'multipart/form-data' } }).then(r => r.data);

// ── Copilot ──
export const askCopilot = (question: string, execMode: string = 'AUTO', context?: string) => {
  const fd = new FormData();
  fd.append('question', question);
  fd.append('execMode', execMode);
  if (context) fd.append('context', context);
  return api.post('/copilot/ask', fd, { headers: { 'Content-Type': 'multipart/form-data' } }).then(r => r.data);
};

// ── Experiments ──
export const getExperiments = () => api.get('/experiments').then(r => r.data);

// ── Copernicus ──
export const searchCopernicus = (data: FormData) =>
  api.post('/copernicus/search', data, { headers: { 'Content-Type': 'multipart/form-data' } }).then(r => r.data);

export const fetchCopernicusImage = (data: FormData) =>
  api.post('/copernicus/image', data, { headers: { 'Content-Type': 'multipart/form-data' } }).then(r => r.data);

export default api;
