import { motion } from 'framer-motion';

export default function AnnouncementBar() {
  const text = 'Limited Time: 25% OFF all Mining Glasses + Free shipping on orders over ₹5,000';

  return (
    <div className="announcement-bar" aria-live="polite">
      <div className="announcement-track">
        {[0, 1].map((i) => (
          <motion.span
            key={i}
            className="announcement-text"
            animate={{ x: ['0%', '-100%'] }}
            transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}
          >
            {text} &nbsp;&nbsp;&nbsp;•&nbsp;&nbsp;&nbsp;
          </motion.span>
        ))}
      </div>
    </div>
  );
}
