import axios from "axios";

const API_URL = "http://localhost:3001";

const authHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
});

export const generateCampaign = async (data) => {
  const response = await axios.post(`${API_URL}/campaign`, data, { headers: authHeader() });
  return response.data;
};

export const generateCopy = async (data) => {
  const response = await axios.post(`${API_URL}/copy`, data, { headers: authHeader() });
  return response.data;
};

export const generateHashtags = async (data) => {
  const response = await axios.post(`${API_URL}/hashtag`, data, { headers: authHeader() });
  return response.data;
};

export const generateCalendar = async (data) => {
  const response = await axios.post(`${API_URL}/calendar`, data, { headers: authHeader() });
  return response.data;
};

export const getHistory = async () => {
  const response = await axios.get(`${API_URL}/history`, { headers: authHeader() });
  return response.data;
};

export const deleteHistoryItemAPI = async (id) => {
  const response = await axios.delete(`${API_URL}/history/${id}`, { headers: authHeader() });
  return response.data;
};

export const clearHistoryAPI = async () => {
  const response = await axios.delete(`${API_URL}/history/clear`, { headers: authHeader() });
  return response.data;
};

export const toggleFavoriteAPI = async (id) => {
  const response = await axios.patch(`${API_URL}/history/${id}/favorite`, {}, { headers: authHeader() });
  return response.data;
};

export const generateTrendsAPI = async (topic) => {
  const response = await axios.post(`${API_URL}/trends`, { topic }, { headers: authHeader() });
  return response.data;
};

export const refineContentAPI = async (type, input, output) => {
  const response = await axios.post(`${API_URL}/refine`, { type, input, output }, { headers: authHeader() });
  return response.data;
};
