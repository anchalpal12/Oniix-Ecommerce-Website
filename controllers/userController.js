const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { emitUserCount } = require('../server'); // For real-time updates

// Signup controller
exports.signup = async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'Email already exists' });
    }

    const newUser = new User({ name, email, password, role });
    await newUser.save();

    // Emit user count but don’t block signup on error
    emitUserCount().catch(err =>
      console.warn('⚠️ emitUserCount failed after signup:', err.message)
    );

    res.status(201).json({ message: 'Signup successful' });
  } catch (err) {
    console.error('❗ Signup error:', err);
    res.status(500).json({ message: 'Server error during signup' });
  }
};

// Login controller
exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password required' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role, name: user.name },
      process.env.JWT_SECRET || 'your_jwt_secret_key',
      { expiresIn: '1h' }
    );

    res.json({
      message: 'Login successful',
      token,
      role: user.role,
      name: user.name,
    });
  } catch (err) {
    console.error('❗ Login error:', err);
    res.status(500).json({ message: 'Server error during login' });
  }
};

// Get total user count
exports.getUserCount = async (req, res) => {
  try {
    const count = await User.countDocuments();
    res.json({ count });
  } catch (err) {
    console.error('❗ Error fetching user count:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all users (excluding passwords)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    console.error('❗ Error fetching users:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update user by ID
exports.updateUser = async (req, res) => {
  const { id } = req.params;
  const { name, email, role } = req.body;

  if (!name || !email || !role) {
    return res.status(400).json({ message: 'Name, email, and role are required' });
  }

  try {
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.name = name;
    user.email = email;
    user.role = role;

    await user.save();

    res.json({ message: 'User updated successfully' });
  } catch (err) {
    console.error('❗ Error updating user:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete user by ID
exports.deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findByIdAndDelete(id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Emit updated user count but don't block on error
    emitUserCount().catch(err =>
      console.warn('⚠️ emitUserCount failed after delete:', err.message)
    );

    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error('❗ Error deleting user:', err);
    res.status(500).json({ message: 'Server error' });
  }
};


// Get total number of users
exports.getUserCount = async (req, res) => {
  try {
    const count = await User.countDocuments();
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get user count', error });
  }
};
