import Layout from '../components/layout/Layout';
import HeroSection from '../components/home/HeroSection';
import StatsBar from '../components/home/StatsBar';
import FeaturedProducts from '../components/home/FeaturedProducts';
import FeaturesGrid from '../components/home/FeaturesGrid';
import HowItWorks from '../components/home/HowItWorks';
import AboutPreview from '../components/home/AboutPreview';
import ServicesSection from '../components/home/ServicesSection';
import GalleryStrip from '../components/home/GalleryStrip';
import Testimonials from '../components/home/Testimonials';
import ComparisonTable from '../components/home/ComparisonTable';
import NewsletterSection, { CTABanner } from '../components/home/NewsletterSection';
import DiscountPopup from '../components/home/DiscountPopup';

export default function Home() {
  return (
    <Layout>
      <HeroSection />
      <StatsBar />
      <FeaturedProducts />
      <FeaturesGrid />
      <AboutPreview />
      <HowItWorks />
      <ServicesSection />
      <GalleryStrip />
      <Testimonials />
      <ComparisonTable />
      <NewsletterSection />
      <CTABanner />
      <DiscountPopup />
    </Layout>
  );
}
