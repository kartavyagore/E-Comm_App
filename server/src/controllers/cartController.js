import { db } from '../utils/storageAdapter.js';

export const verifyCart = async (req, res, next) => {
  try {
    const { items = [] } = req.body;

    if (!Array.isArray(items)) {
      return res.status(400).json({
        success: false,
        message: 'Cart items must be an array.'
      });
    }

    const verifiedItems = [];
    let subtotal = 0;
    const warnings = [];

    for (const item of items) {
      if (!item.id) continue;
      const product = await db.getProductById(item.id);

      if (!product) {
        warnings.push(`Item "${item.title || item.id}" is no longer available in the catalog.`);
        continue;
      }

      // Backend stock verification
      const requestedQty = Math.max(1, parseInt(item.quantity, 10) || 1);
      const availableQty = product.stock_quantity;
      let finalQty = requestedQty;

      if (availableQty <= 0) {
        warnings.push(`"${product.title}" is currently out of stock.`);
        finalQty = 0;
      } else if (requestedQty > availableQty) {
        warnings.push(`Quantity for "${product.title}" adjusted to maximum available stock (${availableQty}).`);
        finalQty = availableQty;
      }

      const verifiedPrice = Number(product.price);
      const itemSubtotal = verifiedPrice * finalQty;
      subtotal += itemSubtotal;

      verifiedItems.push({
        id: product.id,
        slug: product.slug,
        title: product.title,
        price: verifiedPrice, // strictly from DB
        image_url: product.image_url,
        category_name: product.category_name,
        quantity: finalQty,
        stock_quantity: availableQty,
        item_subtotal: itemSubtotal
      });
    }

    // Business calculations
    const shippingThreshold = 250;
    const shipping = subtotal >= shippingThreshold || subtotal === 0 ? 0 : 25;
    const estimatedTax = Math.round(subtotal * 0.08 * 100) / 100; // 8% tax
    const total = Math.round((subtotal + shipping + estimatedTax) * 100) / 100;

    res.status(200).json({
      success: true,
      data: {
        items: verifiedItems,
        subtotal: Math.round(subtotal * 100) / 100,
        shipping,
        shippingThreshold,
        freeShippingEligible: subtotal >= shippingThreshold,
        estimatedTax,
        total,
        warnings
      }
    });
  } catch (err) {
    next(err);
  }
};
