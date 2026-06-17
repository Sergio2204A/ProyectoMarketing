import axios from "axios";

const API_URL = "http://localhost:3001";

export const generateCampaign = async (data) => {
  const response = await axios.post(
    `${API_URL}/campaign`,
    data
  );
  return response.data;
};

export const generateCopy = async (data) => {
  const response = await axios.post(
    `${API_URL}/copy`,
    data
  );
  return response.data;
};

export const generateHashtags = async (data) => {
  const response = await axios.post(
    `${API_URL}/hashtag`,
    data
  );
  return response.data;
};

export const generateCalendar = async (data) => {
  const response = await axios.post(
    `${API_URL}/calendar`,
    data
  );
  return response.data;
};