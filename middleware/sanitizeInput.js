function sanitizeObject(obj) {
  if (!obj || typeof obj !== 'object') return;
  for (const key of Object.keys(obj)) {
    if (key.startsWith('$') || key.includes('.')) {
      delete obj[key];
      continue;
    }
    const value = obj[key];
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      sanitizeObject(value);
    }
    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (item && typeof item === 'object') sanitizeObject(item);
      });
    }
  }
}

function sanitizeInput(req, res, next) {
  if (req.body) sanitizeObject(req.body);
  if (req.params) sanitizeObject(req.params);
  next();
}

module.exports = sanitizeInput;
