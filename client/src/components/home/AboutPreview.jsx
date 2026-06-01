import { Link } from 'react-router-dom';
import ScrollReveal from '../ui/ScrollReveal';

export default function AboutPreview() {
  return (
    <section className="section container">
      <div className="about-preview split-premium">
        <ScrollReveal direction="left" className="about-preview-media">
          <div className="about-image-stack">
            <img src="/images/0a64963e-298b-4da8-88ff-9fcb856db7be.jpg" alt="Onix glasses on site" loading="lazy" className="stack-main" />
            <img src="/images/g.jpg" alt="" loading="lazy" className="stack-accent" />
          </div>
        </ScrollReveal>

        <ScrollReveal direction="right" className="about-preview-copy">
          <span className="section-eyebrow">About Onix</span>
          <h2>Advanced tech for underground warriors</h2>
          <p>
            We design smart mining glasses that empower crews with real-time hazard detection,
            hands-free communication, and rugged durability — because visibility saves lives.
          </p>
          <ul className="check-list">
            <li>ISO-compliant optical standards</li>
            <li>Tested in 60°C+ environments</li>
            <li>Used across 28 countries</li>
          </ul>
          <Link to="/about" className="btn btn-primary">Our story</Link>
        </ScrollReveal>
      </div>
    </section>
  );
}
