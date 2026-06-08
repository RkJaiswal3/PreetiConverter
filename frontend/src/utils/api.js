import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

export const convertText = async ({ text, mode, session_id }) => {
  const { data } = await api.post('/convert', { text, mode, session_id });
  return data;
};

export const getHistory = async (session_id) => {
  const { data } = await api.get(`/history/${session_id}`);
  return data;
};

export const getStats = async () => {
  const { data } = await api.get('/stats');
  return data;
};

export default api;
