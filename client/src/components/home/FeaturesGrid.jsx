import SectionHeader from '../ui/SectionHeader';
import { StaggerContainer, StaggerItem } from '../ui/ScrollReveal';

const FEATURES = [
  {
    title: 'Impact resistance',
    desc: 'Polycarbonate lenses rated for high-velocity debris in underground environments.',
    img: '/images/pngwing.com - 2025-05-29T115058.969.png',
  },
  {
    title: 'Anti-fog coating',
    desc: 'Maintains clarity in humid, high-temperature mine shafts and smelting zones.',
    img: '/images/pngwing.com - 2025-05-29T115317.090.png',
  },
  {
    title: 'UV & glare shield',
    desc: 'Blocks harmful rays and surface glare for open-pit and outdoor operations.',
    img: '/images/pngwing.com - 2025-05-29T115244.011.png',
  },
  {
    title: 'Smart HUD overlay',
    desc: 'Real-time telemetry, navigation pins, and team alerts in your line of sight.',
    img: '/images/68ed65ac-6dec-4c97-bfff-7c92fef3f345.jpg',
  },
  {
    title: 'All-day comfort',
    desc: 'Ergonomic temples and balanced weight distribution for 12-hour shifts.',
    img: '/images/89555cc8-a527-46d9-9791-6d907dc35223.jpg',
  },
  {
    title: 'Enterprise support',
    desc: 'Bulk orders, site deployment, and dedicated account management.',
    img: '/images/d1629196-5a15-4dde-8549-bb3997058777.jpg',
  },
];

export default function FeaturesGrid() {
  return (
    <section className="section section-muted">
      <div className="container">
        <SectionHeader
          eyebrow="Why Onix"
          title="Engineered beyond standard safety glasses"
          subtitle="Every detail is designed for reliability when failure is not an option."
        />

        <StaggerContainer className="features-grid-premium">
          {FEATURES.map((f) => (
            <StaggerItem key={f.title}>
              <article className="feature-card-premium">
                <div className="feature-icon-wrap">
                  <img src={f.img} alt="" loading="lazy" />
                </div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </article>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
