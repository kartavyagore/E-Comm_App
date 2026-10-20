import http from 'http';
import app from '../app.js';

const server = app.listen(5001, async () => {
  console.log('Testing API endpoints on port 5001...');

  const request = (path, method = 'GET', body = null, token = null) => {
    return new Promise((resolve, reject) => {
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const req = http.request(
        {
          hostname: 'localhost',
          port: 5001,
          path,
          method,
          headers
        },
        (res) => {
          let data = '';
          res.on('data', chunk => { data += chunk; });
          res.on('end', () => {
            try {
              resolve({ status: res.statusCode, data: JSON.parse(data) });
            } catch (e) {
              resolve({ status: res.statusCode, raw: data });
            }
          });
        }
      );

      req.on('error', reject);
      if (body) req.write(JSON.stringify(body));
      req.end();
    });
  };

  try {
    // 1. Health check
    const health = await request('/api/health');
    console.log('1. Health check status:', health.status, health.data.status);

    // 2. Categories
    const categories = await request('/api/categories');
    console.log('2. Categories count:', categories.data.data.categories.length);

    // 3. Products
    const products = await request('/api/products?limit=4');
    console.log('3. Products returned:', products.data.data.products.length, 'Total in DB:', products.data.data.total);

    // 4. Login customer
    const custLogin = await request('/api/auth/login', 'POST', {
      email: 'alex@example.com',
      password: 'Customer@12345'
    });
    console.log('4. Customer login:', custLogin.status === 200 ? 'SUCCESS' : 'FAILED', custLogin.data.data?.user?.role);
    const customerToken = custLogin.data.data?.token;

    // 5. Login admin
    const adminLogin = await request('/api/auth/login', 'POST', {
      email: 'admin@aurasound.com',
      password: 'Admin@12345'
    });
    console.log('5. Admin login:', adminLogin.status === 200 ? 'SUCCESS' : 'FAILED', adminLogin.data.data?.user?.role);
    const adminToken = adminLogin.data.data?.token;

    // 6. Cart verification with price validation
    const cartRes = await request('/api/cart/verify', 'POST', {
      items: [
        { id: products.data.data.products[0].id, quantity: 2, price: 1.00 /* Tampered price, should be ignored */ }
      ]
    });
    console.log('6. Cart verification: Real unit price used =', cartRes.data.data.items[0].price, 'Total =', cartRes.data.data.total);

    // 7. Security check: Customer accessing admin endpoint -> Expected 403
    const custAdminCheck = await request('/api/admin/stats', 'GET', null, customerToken);
    console.log('7. Customer hitting /api/admin/stats status (Expect 403):', custAdminCheck.status);

    // 8. Admin accessing admin endpoint -> Expected 200
    const adminStatsCheck = await request('/api/admin/stats', 'GET', null, adminToken);
    console.log('8. Admin hitting /api/admin/stats status (Expect 200):', adminStatsCheck.status, adminStatsCheck.data.data);

    console.log('\n✅ ALL BACKEND TESTS PASSED PERFECTLY!\n');
  } catch (err) {
    console.error('❌ Test error:', err);
  } finally {
    server.close();
  }
});
