import axios from 'axios';

// Use environment variable or fallback to localhost
const API_BASE_URL =  'https://familyexpansistrackbackend-production-3b37.up.railway.app/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken,
          });

          const { accessToken } = response.data.data;
          localStorage.setItem('accessToken', accessToken);

          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, logout user
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;

// API Response Interface
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

// Auth API
export const authApi = {
  sendOtp: (email: string) => api.post<ApiResponse>('/auth/send-otp', { email }),
  verifyOtp: (email: string, otp: string) =>
    api.post<ApiResponse>('/auth/verify-otp', { email, otp }),
  register: (data: any) => api.post<ApiResponse>('/auth/register', data),
  login: (familyCode: string, email: string, password: string) =>
    api.post<ApiResponse>('/auth/login', { familyCode, email, password }),
  logout: (refreshToken: string) => api.post<ApiResponse>('/auth/logout', { refreshToken }),
  forgotFamilyCode: (email: string) => api.post<ApiResponse>('/auth/forgot-family-code', { email }),
};

// Income API
export const incomeApi = {
  getMyIncomes: () => api.get<ApiResponse>('/incomes/my'),
  getFamilyIncomes: () => api.get<ApiResponse>('/incomes/family'),
  getMyStats: () => api.get<ApiResponse>('/incomes/my/stats'),
  getById: (id: string) => api.get<ApiResponse>(`/incomes/${id}`),
  create: (data: any) => api.post<ApiResponse>('/incomes', data),
  update: (id: string, data: any) => api.put<ApiResponse>(`/incomes/${id}`, data),
  delete: (id: string) => api.delete<ApiResponse>(`/incomes/${id}`),
};

// Expense API
export const expenseApi = {
  getMyExpenses: () => api.get<ApiResponse>('/expenses/my'),
  getFamilyExpenses: () => api.get<ApiResponse>('/expenses/family'),
  getMyStats: () => api.get<ApiResponse>('/expenses/my/stats'),
  getById: (id: string) => api.get<ApiResponse>(`/expenses/${id}`),
  create: (data: any) => api.post<ApiResponse>('/expenses', data),
  update: (id: string, data: any) => api.put<ApiResponse>(`/expenses/${id}`, data),
  delete: (id: string) => api.delete<ApiResponse>(`/expenses/${id}`),
};

// Dashboard API
export const dashboardApi = {
  getMyDashboard: () => api.get<ApiResponse>('/dashboard/my'),
  getFamilyDashboard: () => api.get<ApiResponse>('/dashboard/family'),
  getMyTrends: (months?: number) =>
    api.get<ApiResponse>(`/dashboard/my/trends${months ? `?months=${months}` : ''}`),
  getFamilyTrends: (months?: number) =>
    api.get<ApiResponse>(`/dashboard/family/trends${months ? `?months=${months}` : ''}`),
};

// Family API
export const familyApi = {
  getFamily: () => api.get<ApiResponse>('/family'),
  getMembers: () => api.get<ApiResponse>('/family/members'),
  removeMember: (id: string) => api.delete<ApiResponse>(`/family/members/${id}`),
  updateName: (name: string) => api.patch<ApiResponse>('/family/name', { name }),
};

// Reminder API
export const reminderApi = {
  sendToMember: (memberId: string) => api.post<ApiResponse>('/reminders/send-to-member', { memberId }),
  sendToAll: () => api.post<ApiResponse>('/reminders/send-to-all'),
  sendBulk: (memberIds: string[]) => api.post<ApiResponse>('/reminders/send-bulk', { memberIds }),
  sendTest: () => api.post<ApiResponse>('/reminders/test'),
};

