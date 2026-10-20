import { db } from '../utils/storageAdapter.js';
import { emailService } from '../services/emailService.js';

export const createOrder = async (req, res, next) => {
  try {
    const { items = [], customerName, customerEmail, shippingAddress = {} } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Order must contain at least one item.'
      });
    }

    // Determine customer info (authenticated user takes priority)
    const name = req.user?.full_name || customerName;
    const email = req.user?.email || customerEmail;
    const userId = req.user?.id || null;

    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: 'Customer name and email are required to complete the commission.'
      });
    }

    // Strictly verify prices and available stock against database
    const verifiedItems = [];
    let subtotal = 0;

    for (const item of items) {
      if (!item.id) continue;
      const product = await db.getProductById(item.id);

      if (!product) {
        return res.status(400).json({
          success: false,
          message: `Product "${item.title || item.id}" is no longer in the catalog.`
        });
      }

      const qty = Math.max(1, parseInt(item.quantity, 10) || 1);
      if (product.stock_quantity < qty) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for "${product.title}". Available: ${product.stock_quantity}.`
        });
      }

      const verifiedPrice = Number(product.price);
      const itemSubtotal = verifiedPrice * qty;
      subtotal += itemSubtotal;

      verifiedItems.push({
        id: product.id,
        slug: product.slug,
        title: product.title,
        price: verifiedPrice,
        image_url: product.image_url,
        category_name: product.category_name,
        quantity: qty,
        item_subtotal: itemSubtotal
      });
    }

    const shipping = subtotal >= 250 || subtotal === 0 ? 0 : 25;
    const tax = Math.round(subtotal * 0.08 * 100) / 100;
    const total = Math.round((subtotal + shipping + tax) * 100) / 100;

    const order = await db.createOrder({
      userId,
      customerName: name.trim(),
      customerEmail: email.trim(),
      items: verifiedItems,
      subtotal: Math.round(subtotal * 100) / 100,
      shipping,
      tax,
      total,
      shippingAddress
    });

    // Send customer order confirmation email asynchronously
    emailService.sendOrderConfirmationEmail(order).catch((err) => {
      console.warn('Customer order confirmation email notice:', err.message);
    });

    res.status(201).json({
      success: true,
      message: 'Order created successfully.',
      data: {
        order
      }
    });
  } catch (err) {
    next(err);
  }
};

export const getMyOrders = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required to view orders.'
      });
    }

    const orders = await db.getOrdersByCustomer({
      userId: req.user.id,
      email: req.user.email
    });

    res.status(200).json({
      success: true,
      data: {
        orders
      }
    });
  } catch (err) {
    next(err);
  }
};

export const getAdminOrders = async (req, res, next) => {
  try {
    const orders = await db.getAllOrders();

    res.status(200).json({
      success: true,
      data: {
        orders,
        count: orders.length
      }
    });
  } catch (err) {
    next(err);
  }
};

export const updateAdminOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required.'
      });
    }

    const updated = await db.updateOrderStatus(id, status);
    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Order not found.'
      });
    }

    res.status(200).json({
      success: true,
      message: `Order status updated to "${status}".`,
      data: {
        order: updated
      }
    });
  } catch (err) {
    next(err);
  }
};
