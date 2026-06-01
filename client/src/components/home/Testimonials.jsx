import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SectionHeader from '../ui/SectionHeader';
import ScrollReveal from '../ui/ScrollReveal';

const TESTIMONIALS = [
  {
    name: 'Rajesh Kumar',
    role: 'Safety Officer, Hindustan Zinc',
    quote: 'Onix glasses cut our incident response time by 40%. The HUD alerts alone have paid for the investment ten times over.',
    avatar: '/images/first.jpg',
    rating: 5,
  },
  {
    name: 'Sarah Mitchell',
    role: 'Operations Lead, Rio Tinto',
    quote: 'Finally eyewear that survives our smelting floor. Anti-fog performance is best-in-class we have tested.',
    avatar: '/images/four.jpg',
    rating: 5,
  },
  {
    name: 'David Chen',
    role: 'Underground Supervisor',
    quote: 'Comfortable for 10-hour shifts and the team communication integration is seamless. We rolled out 200 units.',
    avatar: '/images/six.jpg',
    rating: 5,
  },
];

export default function Testimonials() {
  const [active, setActive] = useState(0);
  const t = TESTIMONIALS[active];

  return (
    <section className="section section-muted">
      <div className="container">
        <SectionHeader
          eyebrow="Testimonials"
          title="Trusted by safety leaders worldwide"
          subtitle="Real feedback from mining professionals who rely on Onix every shift."
        />

        <ScrollReveal>
          <div className="testimonial-stage">
            <AnimatePresence mode="wait">
              <motion.blockquote
                key={active}
                className="testimonial-card"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -24 }}
                transition={{ duration: 0.4 }}
              >
                <div className="testimonial-stars" aria-label={`${t.rating} stars`}>
                  {'★'.repeat(t.rating)}
                </div>
                <p className="testimonial-quote">&ldquo;{t.quote}&rdquo;</p>
                <footer className="testimonial-author">
                  <img src={t.avatar} alt="" loading="lazy" />
                  <div>
                    <strong>{t.name}</strong>
                    <span>{t.role}</span>
                  </div>
                </footer>
              </motion.blockquote>
            </AnimatePresence>

            <div className="testimonial-dots">
              {TESTIMONIALS.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  className={`dot ${i === active ? 'active' : ''}`}
                  aria-label={`Show testimonial ${i + 1}`}
                  onClick={() => setActive(i)}
                />
              ))}
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
