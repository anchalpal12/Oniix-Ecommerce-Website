import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function HeroSection() {
  return (
    <section className="hero hero-premium">
      <div className="hero-bg" style={{ backgroundImage: "url('/images/sec3.jpg')" }} />
      <div className="hero-overlay" />
      <div className="hero-glow" />

      <div className="container hero-grid">
        <div className="hero-copy">
          <motion.span
            className="eyebrow hero-badge"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            Industry-leading smart eyewear
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.7 }}
          >
            See safer. Work smarter. <span className="text-gradient">Mine better.</span>
          </motion.h1>

          <motion.p
            className="hero-sub"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
          >
            Onix smart mining glasses deliver real-time hazard alerts, hands-free communication,
            and rugged optical clarity — built for the world&apos;s toughest underground jobs.
          </motion.p>

          <motion.div
            className="hero-actions"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Link to="/shop" className="btn btn-primary btn-lg">Shop collection</Link>
            <Link to="/about" className="btn btn-glass btn-lg">Watch demo</Link>
          </motion.div>

          <motion.ul
            className="hero-trust"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.65 }}
          >
            <li>ISO-certified lenses</li>
            <li>48h dispatch</li>
            <li>2-year warranty</li>
          </motion.ul>
        </div>

        <motion.div
          className="hero-visual"
          initial={{ opacity: 0, scale: 0.92, x: 40 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="hero-card-float hero-card-float--1">
            <img src="/images/52d353be-ddcd-4bf5-a5d3-72763d22638f.jpg" alt="Onix mining glasses" />
          </div>
          <div className="hero-card-float hero-card-float--2">
            <strong>Live safety feed</strong>
            <span>Gas levels • Team comms • Navigation</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
