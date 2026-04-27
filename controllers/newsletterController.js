const NewsletterSubscriber = require('../models/NewsletterSubscriber');

exports.subscribe = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const existing = await NewsletterSubscriber.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Already subscribed.' });

    const newSubscriber = new NewsletterSubscriber({ email });
    await newSubscriber.save();
    res.status(201).json({ message: 'Subscribed successfully' });
  } catch (err) {
    console.error('Newsletter subscription error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getAllSubscribers = async (req, res) => {
  try {
    const subscribers = await NewsletterSubscriber.find().sort({ subscribedAt: -1 });
    res.json(subscribers);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching subscribers' });
  }
};
