import api from './api.js';

export const adminService = {
  async getStats() {
    const res = await api.get('/admin/stats');
    return res.data;
  },

  async createProduct(productData) {
    const res = await api.post('/admin/products', productData);
    return res.data;
  },

  async updateProduct(id, productData) {
    const res = await api.put(`/admin/products/${id}`, productData);
    return res.data;
  },

  async deleteProduct(id) {
    const res = await api.delete(`/admin/products/${id}`);
    return res.data;
  },

  async uploadImage(file) {
    const formData = new FormData();
    formData.append('image', file);
    const res = await api.post('/admin/upload', formData);
    return res.data;
  }
};
