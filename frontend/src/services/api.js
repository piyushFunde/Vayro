import axios from 'axios';

const API_BASE = '/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('vayro_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const authApi = {
  login: async (email, password) => {
    const res = await apiClient.post('/auth/login', { email, password });
    return res.data;
  },
  register: async (userData) => {
    const res = await apiClient.post('/auth/register', userData);
    return res.data;
  },
  getCurrentUser: async () => {
    const res = await apiClient.get('/auth/me');
    return res.data;
  },
};

export const rideApi = {
  estimate: async (payload) => {
    const res = await apiClient.post('/rides/estimate', payload);
    return res.data;
  },
  requestRide: async (payload) => {
    const res = await apiClient.post('/rides/request', payload);
    return res.data;
  },
  getRideById: async (rideId) => {
    const res = await apiClient.get(`/rides/${rideId}`);
    return res.data;
  },
  cancelRide: async (rideId, reason) => {
    const res = await apiClient.post(`/rides/${rideId}/cancel`, { reason });
    return res.data;
  },
  getHistory: async () => {
    const res = await apiClient.get('/rides/history');
    return res.data;
  },
  downloadInvoice: async (rideId) => {
    const res = await apiClient.get(`/rides/${rideId}/invoice`, {
      responseType: 'blob',
    });
    const blob = new Blob([res.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `vayro-tax-invoice-${rideId.substring(0, 8)}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};

export const driverApi = {
  updateStatus: async (status) => {
    const res = await apiClient.patch('/drivers/status', { status });
    return res.data;
  },
  updateLocation: async (latitude, longitude, heading = 0) => {
    const res = await apiClient.patch('/drivers/location', { latitude, longitude, heading });
    return res.data;
  },
  acceptRide: async (rideId) => {
    const res = await apiClient.post(`/drivers/rides/${rideId}/accept`);
    return res.data;
  },
  markArrived: async (rideId) => {
    const res = await apiClient.post(`/drivers/rides/${rideId}/arrive`);
    return res.data;
  },
  startRide: async (rideId, otp) => {
    const res = await apiClient.post(`/drivers/rides/${rideId}/start`, { otp });
    return res.data;
  },
  completeRide: async (rideId) => {
    const res = await apiClient.post(`/drivers/rides/${rideId}/complete`);
    return res.data;
  },
};

export const paymentApi = {
  createIntent: async (rideId) => {
    const res = await apiClient.post('/payments/create-intent', { rideId });
    return res.data;
  },
  confirmPayment: async (rideId, paymentIntentId) => {
    const res = await apiClient.post(`/payments/confirm/${rideId}`, { paymentIntentId });
    return res.data;
  },
};

export const ratingApi = {
  submitRating: async (rideId, ratingScore, feedbackComment) => {
    const res = await apiClient.post('/ratings', { rideId, ratingScore, feedbackComment });
    return res.data;
  },
};

export default apiClient;
