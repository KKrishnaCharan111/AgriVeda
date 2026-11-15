const API_BASE = '/api';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('agriveda_token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...(options.headers || {})
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  if (!response.ok) {
    let errorDetail = 'Network request failed';
    try {
      const err = await response.json();
      errorDetail = err.detail || err.message || errorDetail;
    } catch {
      // ignore
    }
    throw new Error(errorDetail);
  }

  return response.json();
}

export const api = {
  // Auth
  login: (data: any) => request<any>('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  register: (data: any) => request<any>('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  getMe: () => request<any>('/auth/me'),
  updateMe: (data: any) => request<any>('/auth/me', { method: 'PUT', body: JSON.stringify(data) }),

  // Crops
  getCrops: (params: string = '') => request<any[]>(`/crops${params ? `?${params}` : ''}`),
  getCrop: (id: number) => request<any>(`/crops/${id}`),
  createCrop: (data: any) => request<any>('/crops', { method: 'POST', body: JSON.stringify(data) }),
  updateCrop: (id: number, data: any) => request<any>(`/crops/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  createOffer: (cropId: number, data: any) => request<any>(`/crops/${cropId}/offers`, { method: 'POST', body: JSON.stringify(data) }),
  getCropOffers: (cropId: number) => request<any[]>(`/crops/${cropId}/offers`),
  updateOffer: (offerId: number, data: any) => request<any>(`/crops/offers/${offerId}`, { method: 'PUT', body: JSON.stringify(data) }),
  createDeal: (data: any) => request<any>('/crops/deals', { method: 'POST', body: JSON.stringify(data) }),
  getMyDeals: () => request<any[]>('/crops/deals/my'),
  updateDealStatus: (dealId: number, data: any) => request<any>(`/crops/deals/${dealId}/status`, { method: 'PUT', body: JSON.stringify(data) }),

  // Labour
  getJobs: (params: string = '') => request<any[]>(`/labour/jobs${params ? `?${params}` : ''}`),
  getJob: (id: number) => request<any>(`/labour/jobs/${id}`),
  createJob: (data: any) => request<any>('/labour/jobs', { method: 'POST', body: JSON.stringify(data) }),
  applyJob: (jobId: number, data: any) => request<any>(`/labour/jobs/${jobId}/apply`, { method: 'POST', body: JSON.stringify(data) }),
  getMyApplications: () => request<any[]>('/labour/applications/my'),
  updateApplicationStatus: (appId: number, data: any) => request<any>(`/labour/applications/${appId}/status`, { method: 'PUT', body: JSON.stringify(data) }),
  getWorkers: (params: string = '') => request<any[]>(`/labour/workers${params ? `?${params}` : ''}`),

  // Shops
  getShops: (params: string = '') => request<any[]>(`/shops${params ? `?${params}` : ''}`),
  getProducts: (params: string = '') => request<any[]>(`/shops/products${params ? `?${params}` : ''}`),
  createProduct: (data: any) => request<any>('/shops/products', { method: 'POST', body: JSON.stringify(data) }),
  getRentals: (params: string = '') => request<any[]>(`/shops/rentals${params ? `?${params}` : ''}`),
  createRental: (data: any) => request<any>('/shops/rentals', { method: 'POST', body: JSON.stringify(data) }),
  createShopEnquiry: (data: any) => request<any>('/shops/enquiries', { method: 'POST', body: JSON.stringify(data) }),
  getMyShopEnquiries: () => request<any[]>('/shops/enquiries/my'),

  // Crop Doctor
  analyzeCrop: (data: any) => request<any>('/crop-doctor/analyze', { method: 'POST', body: JSON.stringify(data) }),
  getDoctorHistory: () => request<any[]>('/crop-doctor/history'),
  requestExpertContact: (data: any) => request<any>('/crop-doctor/expert-request', { method: 'POST', body: JSON.stringify(data) }),
  uploadCropImage: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const token = localStorage.getItem('agriveda_token');
    const res = await fetch(`${API_BASE}/crop-doctor/upload-image`, {
      method: 'POST',
      headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      body: formData
    });
    if (!res.ok) throw new Error('Image upload failed');
    return res.json();
  },

  // Problem Solver
  askProblemSolver: (data: any) => request<any>('/problem-solver/ask', { method: 'POST', body: JSON.stringify(data) }),
  getProblemSolverHistory: () => request<any[]>('/problem-solver/history'),

  // Weather & Mandi Prices & Schemes
  getWeather: (district: string = 'Guntur') => request<any>(`/weather?district=${encodeURIComponent(district)}`),
  getMarketPrices: (params: string = '') => request<any[]>(`/market-prices${params ? `?${params}` : ''}`),
  getSchemes: (params: string = '') => request<any[]>(`/schemes${params ? `?${params}` : ''}`),

  // Farming Assistant
  getReminders: () => request<any[]>('/farming-assistant/reminders'),
  createReminder: (data: any) => request<any>('/farming-assistant/reminders', { method: 'POST', body: JSON.stringify(data) }),
  toggleReminder: (id: number) => request<any>(`/farming-assistant/reminders/${id}/toggle`, { method: 'PUT' }),

  // Payments & Refunds
  createPaymentOrder: (data: any) => request<any>('/payments/orders', { method: 'POST', body: JSON.stringify(data) }),
  checkoutPayment: (data: any) => request<any>('/payments/checkout', { method: 'POST', body: JSON.stringify(data) }),
  getTransactions: () => request<any[]>('/payments/transactions'),
  getSubscriptions: () => request<any[]>('/payments/subscriptions'),
  requestRefund: (data: any) => request<any>('/refunds/request', { method: 'POST', body: JSON.stringify(data) }),
  getMyRefunds: () => request<any[]>('/refunds/my'),

  // Feedback & Notifications
  submitComplaint: (data: any) => request<any>('/feedback/complaints', { method: 'POST', body: JSON.stringify(data) }),
  getMyComplaints: () => request<any[]>('/feedback/complaints/my'),
  getNotifications: () => request<any[]>('/feedback/notifications'),
  markNotificationRead: (id: number) => request<any>(`/feedback/notifications/${id}/read`, { method: 'PUT' }),

  // Admin
  getAdminStats: () => request<any>('/admin/stats'),
  getAllUsers: (role?: string) => request<any[]>(`/admin/users${role ? `?role=${role}` : ''}`),
  toggleUserActive: (userId: number) => request<any>(`/admin/users/${userId}/toggle-active`, { method: 'PUT' }),
  verifyShop: (shopId: number) => request<any>(`/admin/shops/${shopId}/verify`, { method: 'PUT' }),
  getAllRefunds: (status?: string) => request<any[]>(`/admin/refunds${status ? `?status=${status}` : ''}`),
  adminRefundAction: (refundId: number, data: any) => request<any>(`/admin/refunds/${refundId}/action`, { method: 'POST', body: JSON.stringify(data) }),
  getAllComplaints: () => request<any[]>('/admin/complaints'),
  resolveComplaint: (id: number, data: any) => request<any>(`/admin/complaints/${id}/resolve`, { method: 'PUT', body: JSON.stringify(data) }),
  getAuditLogs: () => request<any[]>('/admin/audit-logs'),
};
