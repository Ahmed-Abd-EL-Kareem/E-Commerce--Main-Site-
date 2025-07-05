import { useEffect, useState } from 'react';
import HeroSection from '../../components/HeroSection/HeroSection';
// import CustomPromoSection from '../../components/CustomPromoSection/CustomPromoSection';
import BestsellersSection from '../../components/BestsellersSection/BestsellersSection';
import GuidesSection from '../../components/GuidesSection/GuidesSection';
import PromotionalBanners from '../../components/PromotionalBanners/PromotionalBanners';
import ServicesSection from '../../components/ServicesSection/ServicesSection';
import FeaturedSection from '../../components/FeaturedSection/FeaturedSection';
import RecommendationsSection from '../../components/RecommendationsSection/RecommendationsSection';
import TechSection from '../../components/TechSection/TechSection';
import PopularCategories from '../../components/PopularCategories/PopularCategories';
// import BlogSection from '../../components/BlogSection/BlogSection';
// import FAQSection from '../../components/FAQSection/FAQSection';
import NewHeroSection from '../../components/NewHeroSection/NewHeroSection';

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('https://dummyjson.com/products')
      .then(res => res.json())
      .then(data => {
        setProducts(data.products);
        setLoading(false);
      });
  }, []);

  return (
    <div>
<NewHeroSection />
      {/* <HeroSection /> */}
      {/* <CustomPromoSection /> */}
      <BestsellersSection products={products.slice(0, 10)} loading={loading} />
      <GuidesSection />
      <PromotionalBanners />
      <ServicesSection />
      <FeaturedSection product={products[0]} loading={loading} />
      <RecommendationsSection products={products.slice(10, 20)} loading={loading} />
      <TechSection />
      <PopularCategories />
      {/* <BlogSection /> */}
      {/* <FAQSection /> */}
    
    </div>
  );
};

export default HomePage; 