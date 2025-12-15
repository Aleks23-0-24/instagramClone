import axios from 'axios';
import { safeGetItem, getApiBase } from './runtimeConfig';

// Set base URL from runtime config
try {
  axios.defaults.baseURL = getApiBase();
} catch (e) {
  // ignore
}

// Attach token from secure storage/localStorage on every request to avoid race conditions
axios.interceptors.request.use(async (config) => {
  try {
    const token = await safeGetItem('anime_social_mini_token');
    if (token) {
      config.headers = config.headers || {};
      // Ensure Authorization header is set
      (config.headers as any).Authorization = `Bearer ${token}`;
    }
  } catch (e) {
    // ignore
  }
  return config;
}, (error) => Promise.reject(error));

export default axios;