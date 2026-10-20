import api from './api.js';

export const orderService = {
  async createOrder(orderData) {
    const res = await api.post('/orders', orderData);
    return res.data;
  },

  async getMyOrders() {
    const res = await api.get('/orders/my-orders');
    return res.data;
  },

  async getAdminOrders() {
    const res = await api.get('/orders/admin/all');
    return res.data;
  },

  async updateOrderStatus(orderId, status) {
    const res = await api.put(`/orders/admin/${orderId}/status`, { status });
    return res.data;
  }
};
