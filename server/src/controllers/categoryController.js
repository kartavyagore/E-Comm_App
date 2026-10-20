import { db } from '../utils/storageAdapter.js';

export const getCategories = async (req, res, next) => {
  try {
    const categories = await db.getCategories();
    res.status(200).json({
      success: true,
      data: {
        categories
      }
    });
  } catch (err) {
    next(err);
  }
};
