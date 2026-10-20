import api from './api.js';

export const cartService = {
  async verifyCart(items) {
    const res = await api.post('/cart/verify', { items });
    return res.data;
  }
};
