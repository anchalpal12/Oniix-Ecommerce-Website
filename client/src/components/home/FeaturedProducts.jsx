import { Link } from 'react-router-dom';
import SectionHeader from '../ui/SectionHeader';
import { StaggerContainer, StaggerItem } from '../ui/ScrollReveal';

const FEATURED = [
  { id: 1, title: 'Thick Rim Glasses', price: '₹2,499', tag: 'Best seller', img: '/images/ffcc7a97-97cd-4899-b1d1-7d217430c7b6.jpg' },
  { id: 2, title: 'Smart Mining Glasses', price: '₹2,000', tag: 'Connected', img: '/images/50746b80-92c1-420b-9bcc-a37fea89c3bd.jpg' },
  { id: 3, title: 'Half Rim Glasses', price: '₹1,000', tag: 'Lightweight', img: '/images/glllll.jpg' },
  { id: 4, title: 'Navigator Z1', price: '₹499', tag: 'New', img: '/images/sec3.jpg' },
];

export default function FeaturedProducts() {
  return (
    <section className="section container">
      <SectionHeader
        eyebrow="Catalog"
        title="Featured eyewear"
        subtitle="Hand-picked models trusted by mining crews, safety officers, and industrial teams."
      />

      <StaggerContainer className="product-showcase-grid">
        {FEATURED.map((p) => (
          <StaggerItem key={p.id}>
            <article className="showcase-card">
              <div className="showcase-img-wrap">
                <span className="showcase-tag">{p.tag}</span>
                <img src={p.img} alt={p.title} loading="lazy" />
                <div className="showcase-overlay">
                  <Link to="/shop" className="btn btn-primary btn-sm">View in shop</Link>
                </div>
              </div>
              <div className="showcase-body">
                <h3>{p.title}</h3>
                <p className="price">{p.price}</p>
              </div>
            </article>
          </StaggerItem>
        ))}
      </StaggerContainer>

      <div className="section-cta-row">
        <Link to="/shop" className="link-arrow">Browse full catalog →</Link>
      </div>
    </section>
  );
}
