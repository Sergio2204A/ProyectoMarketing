import axios from "axios";

const API_URL = "http://localhost:3001";

export const loginUser = async (email, password) => {
  const response = await axios.post(`${API_URL}/auth/login`, { email, password });
  return response.data;
};

export const registerUser = async (name, email, password) => {
  const response = await axios.post(`${API_URL}/auth/register`, { name, email, password });
  return response.data;
};
