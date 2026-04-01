import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';


export const processVideo = async (url) => {
  const response = await axios.post(`${API_BASE_URL}/process-video`, { url });
  return response.data;
};

export const queryVideo = async (videoId, query) => {
  const response = await axios.post(`${API_BASE_URL}/query`, {
    video_id: videoId,
    query
  });
  return response.data;
};
