const Product = require('../models/Product');
const { success, error } = require('../utils/apiResponse');
const escapeRegex = require('../utils/escapeRegex');

function getSortOption(sort) {
  switch (sort) {
    case 'price_asc': return { price: 1 };
    case 'price_desc': return { price: -1 };
    case 'name': return { name: 1 };
    default: return { createdAt: -1 };
  }
}

exports.createProduct = async (req, res) => {
  try {
    const { name, description, price, category, imageUrl } = req.body;

    if (!name || !description || price == null || !category || !imageUrl) {
      return error(res, 'All fields are required.', 400);
    }

    const parsedPrice = parseFloat(price);
    if (Number.isNaN(parsedPrice) || parsedPrice < 0) {
      return error(res, 'Price must be a valid positive number.', 400);
    }

    if (imageUrl.startsWith('data:') && imageUrl.length > 500000) {
      return error(res, 'Use an image URL instead of large base64 strings.', 400);
    }

    const product = await Product.create({
      name: name.trim(),
      description: description.trim(),
      price: parsedPrice,
      category: category.trim(),
      imageUrl: imageUrl.trim(),
      stock: req.body.stock != null ? Math.max(0, parseInt(req.body.stock, 10) || 0) : 100,
      compareAtPrice: req.body.compareAtPrice != null ? parseFloat(req.body.compareAtPrice) : undefined,
      badge: req.body.badge?.trim() || undefined,
      rating: req.body.rating != null ? parseFloat(req.body.rating) : undefined,
      reviewCount: req.body.reviewCount != null ? parseInt(req.body.reviewCount, 10) : undefined,
    });

    return success(res, product, 'Product added successfully', 201);
  } catch (err) {
    console.error('createProduct:', err);
    return error(res, 'Could not add product.', 500);
  }
};

exports.getProducts = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 12));
    const skip = (page - 1) * limit;
    const filter = {};

    if (req.query.category) filter.category = req.query.category;
    if (req.query.search) {
      const term = escapeRegex(String(req.query.search).trim());
      if (term) {
        filter.$or = [
          { name: { $regex: term, $options: 'i' } },
          { description: { $regex: term, $options: 'i' } },
        ];
      }
    }

    const [products, total] = await Promise.all([
      Product.find(filter).sort(getSortOption(req.query.sort)).skip(skip).limit(limit).lean(),
      Product.countDocuments(filter),
    ]);

    return success(res, {
      products,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error('getProducts:', err);
    return error(res, 'Could not fetch products.', 500);
  }
};

exports.getProductCount = async (req, res) => {
  try {
    const count = await Product.countDocuments();
    return success(res, { count });
  } catch (err) {
    return error(res, 'Could not count products.', 500);
  }
};

exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return error(res, 'Product not found.', 404);
    return success(res, product);
  } catch (err) {
    return error(res, 'Could not fetch product.', 500);
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const { name, description, price, category, imageUrl, stock } = req.body;
    const updatedData = {};

    if (name) updatedData.name = name.trim();
    if (description) updatedData.description = description.trim();
    if (price != null) {
      const parsedPrice = parseFloat(price);
      if (Number.isNaN(parsedPrice) || parsedPrice < 0) {
        return error(res, 'Price must be a valid positive number.', 400);
      }
      updatedData.price = parsedPrice;
    }
    if (category) updatedData.category = category.trim();
    if (imageUrl) updatedData.imageUrl = imageUrl.trim();
    if (stock != null) updatedData.stock = Math.max(0, parseInt(stock, 10) || 0);

    const product = await Product.findByIdAndUpdate(req.params.id, updatedData, { new: true });
    if (!product) return error(res, 'Product not found.', 404);
    return success(res, product, 'Product updated successfully');
  } catch (err) {
    return error(res, 'Could not update product.', 500);
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) return error(res, 'Product not found.', 404);
    return success(res, null, 'Product deleted successfully');
  } catch (err) {
    return error(res, 'Could not delete product.', 500);
  }
};
