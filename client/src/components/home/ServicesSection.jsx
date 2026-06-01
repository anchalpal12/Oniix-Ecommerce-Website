import { Link } from 'react-router-dom';
import ScrollReveal from '../ui/ScrollReveal';
import SectionHeader from '../ui/SectionHeader';

const SERVICES = [
  { title: 'Buy online', desc: 'Secure checkout with instant order confirmation.', img: '/images/home.jpg' },
  { title: 'Express delivery', desc: 'Priority shipping to remote and industrial sites.', img: '/images/car.jpg' },
  { title: 'Store pickup', desc: 'Collect from authorized safety equipment partners.', img: '/images/circle.jpg' },
  { title: 'Bulk logistics', desc: 'Fleet orders for crews of 50+ with custom invoicing.', img: '/images/bus.jpg' },
];

export default function ServicesSection() {
  return (
    <section className="section section-dark">
      <div className="container">
        <SectionHeader
          eyebrow="Services"
          title="Enterprise-grade shopping experience"
          subtitle="Online, in-store, and on-site — however your team procures gear."
        />

        <div className="services-grid">
          {SERVICES.map((s, i) => (
            <ScrollReveal key={s.title} delay={i * 0.08} direction="up">
              <article className="service-card">
                <img src={s.img} alt="" loading="lazy" />
                <div className="service-body">
                  <h3>{s.title}</h3>
                  <p>{s.desc}</p>
                  <Link to="/contact" className="service-link">Learn more →</Link>
                </div>
              </article>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
