import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

/* Despierta el backend con anticipación (Render "duerme" tras inactividad) para que el login/registro real sea rápido */
export const pingServer = () => {
  axios.get(`${API_URL}/health`).catch(() => {});
};

export const loginUser = async (email, password) => {
  const response = await axios.post(`${API_URL}/auth/login`, { email, password });
  return response.data;
};

export const registerUser = async (name, email, password) => {
  const response = await axios.post(`${API_URL}/auth/register`, { name, email, password });
  return response.data;
};

export const updateProfile = async (token, data) => {
  const response = await axios.put(`${API_URL}/auth/profile`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const forgotPasswordAPI = async (email) => {
  const response = await axios.post(`${API_URL}/auth/forgot-password`, { email });
  return response.data;
};

export const resetPasswordAPI = async (token, password) => {
  const response = await axios.post(`${API_URL}/auth/reset-password/${token}`, { password });
  return response.data;
};
