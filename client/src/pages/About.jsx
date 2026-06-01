import { Link } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import ScrollReveal, { StaggerContainer, StaggerItem } from '../components/ui/ScrollReveal';
import SectionHeader from '../components/ui/SectionHeader';

const TIMELINE = [
  { year: '2019', title: 'Founded in Pune', desc: 'Started with a mission to protect underground workers with connected eyewear.' },
  { year: '2021', title: 'First HUD prototype', desc: 'Deployed pilot units across 12 mining sites in India and Australia.' },
  { year: '2023', title: 'Global expansion', desc: 'Reached 28 countries with ISO-certified product lines and enterprise support.' },
  { year: '2025', title: 'Onix 2.0 platform', desc: 'Launched full e-commerce, team dashboards, and real-time fleet analytics.' },
];

const TEAM_VALUES = [
  { title: 'Safety first', desc: 'Every product decision starts with worker protection.', img: '/images/sec3.jpg' },
  { title: 'Relentless quality', desc: 'Tested beyond industry standards in extreme conditions.', img: '/images/52d353be-ddcd-4bf5-a5d3-72763d22638f.jpg' },
  { title: 'Innovation', desc: 'AR, IoT, and optics — engineered as one integrated system.', img: '/images/50746b80-92c1-420b-9bcc-a37fea89c3bd.jpg' },
];

export default function About() {
  return (
    <Layout>
      <section className="page-hero page-hero--about">
        <div className="page-hero-bg" style={{ backgroundImage: "url('/images/g.jpg')" }} />
        <div className="page-hero-overlay" />
        <div className="container page-hero-content">
          <ScrollReveal>
            <span className="section-eyebrow section-eyebrow--light">Our story</span>
            <h1>Protecting the people who power the world</h1>
            <p>Onix builds smart mining glasses for crews who work where failure isn&apos;t an option.</p>
          </ScrollReveal>
        </div>
      </section>

      <section className="section container">
        <div className="split-premium">
          <ScrollReveal direction="left">
            <h2>Our mission</h2>
            <p>
              At Onix, we are dedicated to revolutionizing the mining industry by integrating cutting-edge
              augmented reality with rugged wearable devices. Our mission is to enhance safety, efficiency,
              and communication for mining professionals worldwide.
            </p>
            <p>
              We believe every underground worker deserves technology that works as hard as they do —
              without adding complexity to an already demanding job.
            </p>
          </ScrollReveal>
          <ScrollReveal direction="right">
            <img src="/images/0a64963e-298b-4da8-88ff-9fcb856db7be.jpg" alt="Onix team at mining site" className="rounded-img shadow-lg" loading="lazy" />
          </ScrollReveal>
        </div>
      </section>

      <section className="section section-muted">
        <div className="container">
          <SectionHeader eyebrow="Values" title="What drives us" subtitle="Three principles guide every product we ship." />
          <StaggerContainer className="grid-3">
            {TEAM_VALUES.map((v) => (
              <StaggerItem key={v.title}>
                <article className="value-card">
                  <img src={v.img} alt="" loading="lazy" />
                  <h3>{v.title}</h3>
                  <p>{v.desc}</p>
                </article>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      <section className="section container">
        <SectionHeader eyebrow="Timeline" title="Our journey" align="left" />
        <div className="timeline">
          {TIMELINE.map((item, i) => (
            <ScrollReveal key={item.year} delay={i * 0.1}>
              <article className="timeline-item">
                <span className="timeline-year">{item.year}</span>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.desc}</p>
                </div>
              </article>
            </ScrollReveal>
          ))}
        </div>
      </section>

      <section className="cta-banner">
        <div className="container cta-inner">
          <ScrollReveal>
            <h2>Join the Onix community</h2>
            <p>Explore products built for the toughest jobs on earth.</p>
            <Link to="/shop" className="btn btn-primary btn-lg">Shop collection</Link>
          </ScrollReveal>
        </div>
      </section>
    </Layout>
  );
}
