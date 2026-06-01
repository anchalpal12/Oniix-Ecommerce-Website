import SectionHeader from '../ui/SectionHeader';
import { StaggerContainer, StaggerItem } from '../ui/ScrollReveal';

const GALLERY = [
  '/images/sec.jpg',
  '/images/seven.jpg',
  '/images/eight.jpg',
  '/images/five.jpg',
  '/images/52d353be-ddcd-4bf5-a5d3-72763d22638f.jpg',
  '/images/50746b80-92c1-420b-9bcc-a37fea89c3bd.jpg',
];

export default function GalleryStrip() {
  return (
    <section className="gallery-section">
      <div className="container">
        <SectionHeader
          eyebrow="In the field"
          title="Built for real mining conditions"
          subtitle="From open-pit to deep shaft — Onix performs where it counts."
        />
      </div>
      <div className="gallery-marquee">
        <div className="gallery-track">
          {[...GALLERY, ...GALLERY].map((src, i) => (
            <div key={`${src}-${i}`} className="gallery-item">
              <img src={src} alt="" loading="lazy" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
