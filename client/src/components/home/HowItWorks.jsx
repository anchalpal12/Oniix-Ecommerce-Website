import SectionHeader from '../ui/SectionHeader';
import ScrollReveal, { StaggerContainer, StaggerItem } from '../ui/ScrollReveal';

const STEPS = [
  { step: '01', title: 'Browse & compare', desc: 'Filter by category, price, and safety rating. Read specs built for your site.', icon: '🔍' },
  { step: '02', title: 'Customize & order', desc: 'Apply team coupons, add to cart, and checkout with secure invoicing.', icon: '🛒' },
  { step: '03', title: 'Fast fulfillment', desc: 'Orders dispatched within 48 hours with tracked shipping nationwide.', icon: '📦' },
  { step: '04', title: 'Deploy & support', desc: 'On-site setup guides, warranty coverage, and 24/7 technical assistance.', icon: '🛡️' },
];

export default function HowItWorks() {
  return (
    <section className="section container">
      <SectionHeader
        eyebrow="Process"
        title="From browse to underground in 4 steps"
        subtitle="A frictionless buying experience designed for individuals and enterprise teams."
      />

      <StaggerContainer className="steps-grid">
        {STEPS.map((s, i) => (
          <StaggerItem key={s.step}>
            <article className="step-card">
              {i < STEPS.length - 1 && <span className="step-connector" aria-hidden="true" />}
              <span className="step-icon">{s.icon}</span>
              <span className="step-num">{s.step}</span>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
            </article>
          </StaggerItem>
        ))}
      </StaggerContainer>
    </section>
  );
}
