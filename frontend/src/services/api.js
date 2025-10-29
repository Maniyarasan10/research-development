import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const apiClient = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (credentials) => apiClient.post('/auth/login', credentials),
  verify: () => apiClient.get('/auth/verify'),
};

export const staffAPI = {
  getAll: (params) => apiClient.get('/admin/staff', { params }),
  create: (data) => apiClient.post('/admin/staff', data),
  update: (id, data) => apiClient.put(`/admin/staff/${id}`, data),
  delete: (id) => apiClient.delete(`/admin/staff/${id}`),
};

export const studentAPI = {
  getAll: (params) => apiClient.get('/students', { params }),
  create: (data) => apiClient.post('/students', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  update: (id, data) => apiClient.put(`/students/${id}`, data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  delete: (id) => apiClient.delete(`/students/${id}`),
};

export const staffDetailsAPI = {
  getAll: (params) => apiClient.get('/staff-details', { params }),
  create: (data) => apiClient.post('/staff-details', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  update: (id, data) => apiClient.put(`/staff-details/${id}`, data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  delete: (id) => apiClient.delete(`/staff-details/${id}`),
};

export const iprAPI = {
  getAll: (params) => apiClient.get('/ipr', { params }),
  create: (data) => apiClient.post('/ipr', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  update: (id, data) => apiClient.put(`/ipr/${id}`, data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  delete: (id) => apiClient.delete(`/ipr/${id}`),
};

export const dashboardAPI = {
  getStats: () => apiClient.get('/dashboard/stats'),
};

export const fileAPI = {
  downloadFile: async (filename) => {
    try {
      const response = await apiClient.get(`/files/${encodeURIComponent(filename)}`, {
        responseType: 'blob',
      });

      // Create a URL for the blob
      const url = window.URL.createObjectURL(new Blob([response.data]));
      
      // Create a temporary link element to trigger the download
      const link = document.createElement('a');
      link.href = url;
      
      // Try to get the original filename from the Content-Disposition header
      const contentDisposition = response.headers['content-disposition'];
      let downloadFilename = filename;
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch && filenameMatch.length > 1) {
          downloadFilename = filenameMatch[1];
        }
      }
      
      link.setAttribute('download', downloadFilename);
      
      // Append to the document, click, and then remove
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Error downloading file:', error);
      if (error.message === 'Authentication token not found. Please log in again.') {
        alert(error.message);
      } else if (error.response?.status === 401) {
        alert('Your session has expired. Please log in again.');
      } else {
        alert('Failed to download file. It may have been moved or deleted.');
      }
    }
  },
};