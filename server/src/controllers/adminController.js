import { db } from '../utils/storageAdapter.js';
import { uploadToSupabaseStorage, deleteFromSupabaseStorage } from '../config/supabaseStorage.js';

export const createProduct = async (req, res, next) => {
  try {
    const {
      title,
      description,
      price,
      category_id,
      category_name,
      image_url,
      storage_path,
      cloudinary_public_id,
      stock_quantity,
      is_featured,
      specifications
    } = req.body;

    if (!title || !description || price === undefined || !image_url) {
      return res.status(400).json({
        success: false,
        message: 'Product title, description, price, and image are required.'
      });
    }

    if (Number(price) < 0) {
      return res.status(400).json({
        success: false,
        message: 'Price cannot be negative.'
      });
    }

    const finalStoragePath = storage_path || cloudinary_public_id || null;

    const product = await db.createProduct({
      title: title.trim(),
      description: description.trim(),
      price: Number(price),
      category_id: category_id || '',
      category_name: category_name || 'General',
      image_url: image_url.trim(),
      storage_path: finalStoragePath,
      cloudinary_public_id: finalStoragePath,
      stock_quantity: Math.max(0, parseInt(stock_quantity, 10) || 0),
      is_featured: Boolean(is_featured),
      specifications: typeof specifications === 'object' ? specifications : {}
    });

    res.status(201).json({
      success: true,
      message: 'Product created successfully.',
      data: {
        product
      }
    });
  } catch (err) {
    next(err);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await db.getProductById(id);

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.'
      });
    }

    const updates = { ...req.body };
    if (updates.price !== undefined) {
      updates.price = Number(updates.price);
      if (updates.price < 0) {
        return res.status(400).json({
          success: false,
          message: 'Price cannot be negative.'
        });
      }
    }
    if (updates.stock_quantity !== undefined) {
      updates.stock_quantity = Math.max(0, parseInt(updates.stock_quantity, 10) || 0);
    }
    if (updates.is_featured !== undefined) {
      updates.is_featured = Boolean(updates.is_featured);
    }
    if (updates.storage_path && !updates.cloudinary_public_id) {
      updates.cloudinary_public_id = updates.storage_path;
    }

    const updated = await db.updateProduct(id, updates);

    res.status(200).json({
      success: true,
      message: 'Product updated successfully.',
      data: {
        product: updated
      }
    });
  } catch (err) {
    next(err);
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await db.getProductById(id);

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.'
      });
    }

    // Clean up Supabase S3 bucket asset if storage_path / public_id was saved
    const assetPath = existing.storage_path || existing.cloudinary_public_id;
    if (assetPath) {
      try {
        await deleteFromSupabaseStorage(assetPath);
      } catch (storageErr) {
        console.warn('Could not delete Supabase S3 asset:', storageErr.message);
      }
    }

    await db.deleteProduct(id);

    res.status(200).json({
      success: true,
      message: `Product "${existing.title}" deleted successfully.`
    });
  } catch (err) {
    next(err);
  }
};

export const uploadImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an image file to upload.'
      });
    }

    const result = await uploadToSupabaseStorage(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype
    );

    res.status(200).json({
      success: true,
      message: 'Image uploaded successfully to Supabase S3 bucket.',
      data: {
        image_url: result.secure_url || result.image_url,
        storage_path: result.storage_path,
        public_id: result.public_id
      }
    });
  } catch (err) {
    next(err);
  }
};

export const getStats = async (req, res, next) => {
  try {
    const stats = await db.getStats();
    res.status(200).json({
      success: true,
      data: {
        stats
      }
    });
  } catch (err) {
    next(err);
  }
};

