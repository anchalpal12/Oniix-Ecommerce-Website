const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// Create a new product (via image URL)
router.post('/', async (req, res) => {
  try {
    const { name, description, price, category, imageUrl } = req.body;

    if (!name || !description || !price || !category || !imageUrl) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      return res.status(400).json({ message: 'Price must be a valid positive number.' });
    }

    const newProduct = new Product({
      name: name.trim(),
      description: description.trim(),
      price: parsedPrice,
      category: category.trim(),
      imageUrl: imageUrl.trim()
    });

    await newProduct.save();
    res.status(201).json({ message: 'Product added successfully', product: newProduct });

  } catch (err) {
    console.error('Error saving product:', err);
    res.status(500).json({ message: 'Server error. Could not add product.' });
  }
});

// ✅ GET total product count
router.get('/count', async (req, res) => {
  try {
    const count = await Product.countDocuments();
    res.status(200).json({ count });
  } catch (err) {
    console.error('Error counting products:', err);
    res.status(500).json({ message: 'Server error. Could not count products.' });
  }
});

// Get all products
router.get('/', async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.status(200).json(products);
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ message: 'Server error. Could not fetch products.' });
  }
});

// Get a single product by ID
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.status(200).json(product);
  } catch (err) {
    console.error('Error fetching product:', err);
    res.status(500).json({ message: 'Server error. Could not fetch product.' });
  }
});

// Update an existing product
router.put('/:id', async (req, res) => {
  try {
    const { name, description, price, category, imageUrl } = req.body;

    const updatedData = {};

    if (name) updatedData.name = name.trim();
    if (description) updatedData.description = description.trim();
    if (price) {
      const parsedPrice = parseFloat(price);
      if (isNaN(parsedPrice) || parsedPrice < 0) {
        return res.status(400).json({ message: 'Price must be a valid positive number.' });
      }
      updatedData.price = parsedPrice;
    }
    if (category) updatedData.category = category.trim();
    if (imageUrl) updatedData.imageUrl = imageUrl.trim();

    const product = await Product.findByIdAndUpdate(req.params.id, updatedData, { new: true });
    if (!product) return res.status(404).json({ message: 'Product not found' });

    res.status(200).json({ message: 'Product updated successfully', product });

  } catch (err) {
    console.error('Error updating product:', err);
    res.status(500).json({ message: 'Server error. Could not update product.' });
  }
});

// Delete a product
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Product not found' });
    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (err) {
    console.error('Error deleting product:', err);
    res.status(500).json({ message: 'Server error. Could not delete product.' });
  }
});

module.exports = router;
