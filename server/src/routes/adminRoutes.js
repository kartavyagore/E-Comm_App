import express from 'express';
import {
  createProduct,
  updateProduct,
  deleteProduct,
  uploadImage,
  getStats
} from '../controllers/adminController.js';
import { verifyToken, requireAdmin } from '../middleware/auth.js';
import { uploadSingleImage } from '../middleware/upload.js';

const router = express.Router();

// Apply backend role-based authentication to all admin routes
router.use(verifyToken, requireAdmin);

router.get('/stats', getStats);
router.post('/products', createProduct);
router.put('/products/:id', updateProduct);
router.delete('/products/:id', deleteProduct);
router.post('/upload', uploadSingleImage, uploadImage);

export default router;
