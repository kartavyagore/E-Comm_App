import api from './api.js';

export const productService = {
  async getProducts({ search = '', category = '', sort = 'newest', page = 1, limit = 12 } = {}) {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (category && category !== 'all') params.append('category', category);
    if (sort) params.append('sort', sort);
    if (page) params.append('page', page);
    if (limit) params.append('limit', limit);

    const res = await api.get(`/products?${params.toString()}`);
    return res.data;
  },

  async getFeaturedProducts() {
    const res = await api.get('/products/featured');
    return res.data;
  },

  async getProductById(id) {
    const res = await api.get(`/products/${id}`);
    return res.data;
  },

  async getCategories() {
    const res = await api.get('/categories');
    return res.data;
  }
};
