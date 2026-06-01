const Review = require('../models/Review');
const Product = require('../models/Product');
const mongoose = require('mongoose');
const { success, error } = require('../utils/apiResponse');

exports.getProductReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ productId: req.params.productId })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    const stats = await Review.aggregate([
      { $match: { productId: new mongoose.Types.ObjectId(req.params.productId) } },
      {
        $group: {
          _id: null,
          avgRating: { $avg: '$rating' },
          count: { $sum: 1 },
        },
      },
    ]);

    return success(res, {
      reviews,
      avgRating: stats[0]?.avgRating ? Math.round(stats[0].avgRating * 10) / 10 : 0,
      count: stats[0]?.count || 0,
    });
  } catch (err) {
    return error(res, 'Could not fetch reviews.', 500);
  }
};

exports.createReview = async (req, res) => {
  try {
    const { productId, rating, comment, userName } = req.body;

    if (!productId || !rating || !comment) {
      return error(res, 'Product, rating, and comment are required.', 400);
    }

    const product = await Product.findById(productId);
    if (!product) return error(res, 'Product not found.', 404);

    const review = await Review.create({
      productId,
      userId: req.user?.id,
      userName: userName || req.user?.name || 'Customer',
      rating: Math.min(5, Math.max(1, parseInt(rating, 10))),
      comment: comment.trim(),
    });

    return success(res, review, 'Review submitted.', 201);
  } catch (err) {
    return error(res, 'Could not submit review.', 500);
  }
};

exports.getCategories = async (req, res) => {
  try {
    const categories = await Product.distinct('category');
    return success(res, categories.filter(Boolean).sort());
  } catch (err) {
    return error(res, 'Could not fetch categories.', 500);
  }
};
