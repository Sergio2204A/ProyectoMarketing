import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

const authHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
});

export const publishContentAPI = async (platform, content, imageUrl = null) => {
  const response = await axios.post(
    `${API_URL}/publish`,
    { platform, content, imageUrl },
    { headers: authHeader() }
  );
  return response.data;
};

export const getSocialCredentialsAPI = async () => {
  const response = await axios.get(`${API_URL}/publish/credentials`, { headers: authHeader() });
  return response.data;
};

export const saveSocialCredentialsAPI = async (platform, credentials) => {
  const response = await axios.post(
    `${API_URL}/publish/credentials`,
    { platform, credentials },
    { headers: authHeader() }
  );
  return response.data;
};

export const disconnectSocialAPI = async (platform) => {
  const response = await axios.delete(`${API_URL}/publish/credentials/${platform}`, {
    headers: authHeader(),
  });
  return response.data;
};
