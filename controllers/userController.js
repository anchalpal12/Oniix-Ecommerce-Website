const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { emitUserCount } = require('../utils/socketEvents');
const { getJwtSecret } = require('../middleware/auth');
const { success, error } = require('../utils/apiResponse');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

exports.signup = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return error(res, 'Name, email, and password are required', 400);
  }

  if (!EMAIL_REGEX.test(email)) {
    return error(res, 'Invalid email format', 400);
  }

  try {
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return error(res, 'Email already exists', 409);
    }

    const newUser = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: 'user',
    });
    await newUser.save();

    emitUserCount().catch((err) =>
      console.warn('⚠️ emitUserCount failed after signup:', err.message)
    );

    return success(res, null, 'Signup successful', 201);
  } catch (err) {
    console.error('❗ Signup error:', err);
    return error(res, 'Server error during signup', 500);
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return error(res, 'Email and password required', 400);
  }

  try {
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return error(res, 'Invalid email or password', 401);
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return error(res, 'Invalid email or password', 401);
    }

    const token = jwt.sign(
      { id: user._id, role: user.role, name: user.name, email: user.email },
      getJwtSecret(),
      { expiresIn: '7d' }
    );

    return success(res, {
      token,
      role: user.role,
      name: user.name,
      email: user.email,
      _id: user._id,
    }, 'Login successful');
  } catch (err) {
    console.error('❗ Login error:', err);
    return error(res, 'Server error during login', 500);
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return error(res, 'User not found', 404);
    return success(res, user);
  } catch (err) {
    return error(res, 'Server error', 500);
  }
};

exports.getUserCount = async (req, res) => {
  try {
    const count = await User.countDocuments();
    return success(res, { count });
  } catch (err) {
    return error(res, 'Server error', 500);
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    return success(res, users);
  } catch (err) {
    return error(res, 'Server error', 500);
  }
};

exports.updateUser = async (req, res) => {
  const { id } = req.params;
  const { name, email, role } = req.body;

  if (!name || !email || !role) {
    return error(res, 'Name, email, and role are required', 400);
  }

  if (!['user', 'admin'].includes(role)) {
    return error(res, 'Invalid role', 400);
  }

  try {
    const user = await User.findById(id);
    if (!user) return error(res, 'User not found', 404);

    user.name = name.trim();
    user.email = email.toLowerCase().trim();
    user.role = role;
    await user.save();

    return success(res, null, 'User updated successfully');
  } catch (err) {
    console.error('❗ Error updating user:', err);
    return error(res, 'Server error', 500);
  }
};

exports.deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    if (req.user.id === id) {
      return error(res, 'You cannot delete your own account', 400);
    }

    const user = await User.findByIdAndDelete(id);
    if (!user) return error(res, 'User not found', 404);

    emitUserCount().catch((err) =>
      console.warn('⚠️ emitUserCount failed after delete:', err.message)
    );

    return success(res, null, 'User deleted successfully');
  } catch (err) {
    console.error('❗ Error deleting user:', err);
    return error(res, 'Server error', 500);
  }
};
