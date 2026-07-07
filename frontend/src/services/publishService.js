import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

const authHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
});

export const publishContentAPI = async (platform, content, imageUrl = null, videoUrl = null) => {
  const response = await axios.post(
    `${API_URL}/publish`,
    { platform, content, imageUrl, videoUrl },
    { headers: authHeader() }
  );
  return response.data;
};

export const getMetaConnectUrlAPI = async () => {
  const response = await axios.get(`${API_URL}/social/meta/connect`, { headers: authHeader() });
  return response.data;
};

export const getTikTokConnectUrlAPI = async () => {
  const response = await axios.get(`${API_URL}/social/tiktok/connect`, { headers: authHeader() });
  return response.data;
};

export const getMetaPendingPagesAPI = async () => {
  const response = await axios.get(`${API_URL}/social/meta/pending-pages`, { headers: authHeader() });
  return response.data;
};

export const selectMetaPageAPI = async (pageId) => {
  const response = await axios.post(
    `${API_URL}/social/meta/select-page`,
    { pageId },
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
