import { db } from '../utils/storageAdapter.js';

export const getProducts = async (req, res, next) => {
  try {
    const { search = '', category = '', sort = 'newest', page = 1, limit = 12 } = req.query;

    const result = await db.getProducts({
      search,
      category,
      sort,
      page: Number(page) || 1,
      limit: Number(limit) || 12
    });

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (err) {
    next(err);
  }
};

export const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await db.getProductById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        product
      }
    });
  } catch (err) {
    next(err);
  }
};

export const getFeaturedProducts = async (req, res, next) => {
  try {
    const result = await db.getProducts({ limit: 4, sort: 'rating' });
    const featured = result.products.filter(p => p.is_featured);

    res.status(200).json({
      success: true,
      data: {
        products: featured.length > 0 ? featured : result.products.slice(0, 4)
      }
    });
  } catch (err) {
    next(err);
  }
};
