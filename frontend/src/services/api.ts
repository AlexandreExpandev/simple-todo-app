import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log(`🚀 API Call: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error(`❌ API Error: ${error.response?.status} ${error.config?.url}`, error.response?.data);
    return Promise.reject(error);
  }
);

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
  total?: number;
}

export const userService = {
  // GET /api/v1/users
  getUsers: async (): Promise<ApiResponse<User[]>> => {
    const response = await api.get('/users');
    return response.data;
  },

  // GET /api/v1/users/:id
  getUser: async (id: number): Promise<ApiResponse<User>> => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  // POST /api/v1/users
  createUser: async (userData: Omit<User, 'id'>): Promise<ApiResponse<User>> => {
    const response = await api.post('/users', userData);
    return response.data;
  },

  // PUT /api/v1/users/:id
  updateUser: async (id: number, userData: Partial<Omit<User, 'id'>>): Promise<ApiResponse<User>> => {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
  },

  // DELETE /api/v1/users/:id
  deleteUser: async (id: number): Promise<ApiResponse<User>> => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  }
};

export const healthService = {
  // GET /api/v1/health
  getHealth: async () => {
    const response = await api.get('/health');
    return response.data;
  }
};

export default api;