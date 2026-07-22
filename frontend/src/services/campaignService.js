import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

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

export const getUpcomingCalendarAPI = async () => {
  const response = await axios.get(`${API_URL}/calendar/upcoming`, { headers: authHeader() });
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

export const updateStatusAPI = async (id, status) => {
  const response = await axios.patch(`${API_URL}/history/${id}/status`, { status }, { headers: authHeader() });
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

export const updateImageUrlAPI = async (id, imageUrl) => {
  const response = await axios.patch(`${API_URL}/history/${id}/image`, { imageUrl }, { headers: authHeader() });
  return response.data;
};

export const generateVideoScriptAPI = async (data) => {
  const response = await axios.post(`${API_URL}/video`, data, { headers: authHeader() });
  return response.data;
};

export const generateImageOpenAIAPI = async (prompt, imageFile, size, quality) => {
  const formData = new FormData();
  formData.append("prompt", prompt);
  if (imageFile) formData.append("image", imageFile);
  if (size) formData.append("size", size);
  if (quality) formData.append("quality", quality);
  const response = await axios.post(`${API_URL}/image/generate`, formData, {
    headers: { ...authHeader(), "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const getOpenAiKeyStatusAPI = async () => {
  const response = await axios.get(`${API_URL}/account/openai-key`, { headers: authHeader() });
  return response.data;
};

export const saveOpenAiKeyAPI = async (apiKey) => {
  const response = await axios.post(`${API_URL}/account/openai-key`, { apiKey }, { headers: authHeader() });
  return response.data;
};

export const deleteOpenAiKeyAPI = async () => {
  const response = await axios.delete(`${API_URL}/account/openai-key`, { headers: authHeader() });
  return response.data;
};

export const videoScriptChatAPI = async (messages, context) => {
  const response = await axios.post(`${API_URL}/video/chat`, { messages, context }, { headers: authHeader() });
  return response.data;
};

export const updateVideoUrlAPI = async (id, videoUrl) => {
  const response = await axios.patch(`${API_URL}/history/${id}/video`, { videoUrl }, { headers: authHeader() });
  return response.data;
};

export const updateOutputAPI = async (id, output) => {
  const response = await axios.patch(`${API_URL}/history/${id}/output`, { output }, { headers: authHeader() });
  return response.data;
};

export const saveGenerationAPI = async (type, input, output) => {
  const response = await axios.post(`${API_URL}/history/save`, { type, input, output }, { headers: authHeader() });
  return response.data;
};

export const generateRealVideoAPI = async (data) => {
  const response = await axios.post(`${API_URL}/video/real`, data, { headers: authHeader() });
  return response.data;
};

export const getRealVideoStatusAPI = async (taskId) => {
  const response = await axios.get(`${API_URL}/video/real/${taskId}`, { headers: authHeader() });
  return response.data;
};
