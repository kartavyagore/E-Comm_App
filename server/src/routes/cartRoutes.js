import express from 'express';
import { verifyCart } from '../controllers/cartController.js';

const router = express.Router();

router.post('/verify', verifyCart);

export default router;
