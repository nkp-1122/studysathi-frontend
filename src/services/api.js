import axios from 'axios';

const normalizeApiBaseUrl = (value) => {
  const trimmedValue = String(value || '/api').trim();

  if (!trimmedValue) {
    return '/api';
  }

  return trimmedValue.endsWith('/') ? trimmedValue.slice(0, -1) : trimmedValue;
};

const isAbsoluteUrl = (value) => /^https?:\/\//i.test(String(value || ''));

export const API_BASE_URL = normalizeApiBaseUrl(import.meta.env.VITE_API_BASE_URL || '/api');

export const resolveAssetUrl = (value) => {
  const trimmedValue = typeof value === 'string' ? value.trim() : '';

  if (!trimmedValue || trimmedValue === '#') {
    return '';
  }

  if (isAbsoluteUrl(trimmedValue)) {
    return trimmedValue;
  }

  if (trimmedValue.startsWith('/api/')) {
    if (!isAbsoluteUrl(API_BASE_URL)) {
      return trimmedValue;
    }

    return new URL(trimmedValue, new URL(API_BASE_URL).origin).toString();
  }

  return trimmedValue;
};

export const isUploadedDocumentUrl = (value) =>
  typeof value === 'string'
  && /^(\/api\/uploads\/|https?:\/\/[^/]+\/api\/uploads\/)/i.test(value.trim());

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('studysathi_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
