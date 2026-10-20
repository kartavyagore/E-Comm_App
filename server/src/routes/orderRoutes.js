import express from 'express';
import jwt from 'jsonwebtoken';
import { ENV } from '../config/env.js';
import { db } from '../utils/storageAdapter.js';
import {
  createOrder,
  getMyOrders,
  getAdminOrders,
  updateAdminOrderStatus
} from '../controllers/orderController.js';
import { verifyToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Optional auth middleware so logged-in users get their id attached automatically
const optionalAuth = async (req, res, next) => {
  try {
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, ENV.JWT_SECRET);
      const user = await db.getUserById(decoded.id);
      if (user) req.user = user;
    }
  } catch (e) {
    // Guest checkout, ignore error
  }
  next();
};

// Customer routes
router.post('/', optionalAuth, createOrder);
router.get('/my-orders', verifyToken, getMyOrders);

// Admin-only routes
router.get('/admin/all', verifyToken, requireAdmin, getAdminOrders);
router.put('/admin/:id/status', verifyToken, requireAdmin, updateAdminOrderStatus);

export default router;
