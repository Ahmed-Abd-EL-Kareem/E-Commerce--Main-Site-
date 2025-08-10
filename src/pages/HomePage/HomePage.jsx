import { useEffect, useState } from 'react';
import { useQuery } from "@tanstack/react-query";
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
import { 
  fetchAllProducts, 
  fetchFeaturedProducts, 
  fetchBestsellerProducts,
  transformProducts 
} from '../../utils/api';

const HomePage = () => {
  // Use React Query for data fetching with the new API utility functions
  const { data: allProducts = [], isLoading: allProductsLoading } = useQuery({
    queryKey: ["homepage-all-products"],
    queryFn: fetchAllProducts,
  });

  const { data: featuredProducts = [], isLoading: featuredLoading } = useQuery({
    queryKey: ["homepage-featured-products"],
    queryFn: fetchFeaturedProducts,
  });

  const { data: bestsellerProducts = [], isLoading: bestsellerLoading } = useQuery({
    queryKey: ["homepage-bestseller-products"],
    queryFn: fetchBestsellerProducts,
  });

  // Transform API data to match component expectations
  const transformedAllProducts = transformProducts(allProducts);
  const transformedFeaturedProducts = transformProducts(featuredProducts);
  const transformedBestsellerProducts = transformProducts(bestsellerProducts);

  // Use all products as fallback if bestseller products are empty
  const productsToShow = transformedBestsellerProducts.length > 0 
    ? transformedBestsellerProducts 
    : transformedAllProducts;

  // Debug logging
  console.log('HomePage Debug:', {
    allProducts: allProducts.length,
    featuredProducts: featuredProducts.length,
    bestsellerProducts: bestsellerProducts.length,
    transformedBestsellerProducts: transformedBestsellerProducts.length,
    transformedAllProducts: transformedAllProducts.length,
    productsToShow: productsToShow.length,
    bestsellerLoading,
    allProductsLoading,
    usingFallback: transformedBestsellerProducts.length === 0 && transformedAllProducts.length > 0
  });

  return (
    <div>
      <NewHeroSection />
      {/* <HeroSection /> */}
      {/* <CustomPromoSection /> */}
      <BestsellersSection 
        products={productsToShow} 
        loading={bestsellerLoading || allProductsLoading} 
      />
      <GuidesSection />
      <PromotionalBanners />
      <ServicesSection />
      <FeaturedSection 
        product={transformedFeaturedProducts[0]} 
        loading={featuredLoading} 
      />
      <RecommendationsSection 
        products={transformedAllProducts.slice(0, 20)} 
        loading={allProductsLoading} 
      />
      <TechSection />
      <PopularCategories />
      {/* <BlogSection /> */}
      {/* <FAQSection /> */}
    </div>
  );
};

export default HomePage;
