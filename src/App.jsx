import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/NavbarMain/NavbarMain';
import SecondNavbar from './components/SecondNavbar/SecondNavbar';
import './i18n'; // Initialize i18n
import HomePage from './pages/HomePage/HomePage';
import Cart from './pages/Cart/Cart';
import SearchResults from './pages/SearchResults/SearchResults';
import ProductDetails from './pages/ProductDetails/ProductDetails';
import Products from './pages/Products/Products';
import Contact from './pages/Contact/Contact';
import About from './pages/About/About';
import Login from './pages/Auth/Login';
import Signup from './pages/Auth/Signup';
import { Profile } from './pages/Profile';
import Footer from './components/Footer/Footer';
import { CartProvider } from './context/CartContext';
import { SearchProvider } from './context/SearchContext';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { FavoritesProvider } from './context/FavoritesContext';
import { Toaster } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { CategoryProvider } from './context/CategoryContext';

// Placeholder components for pages that need to be built
const CategoryPage = ({ categoryName }) => (
  <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-16">
    <div className="max-w-7xl mx-auto px-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4 capitalize">
          {categoryName} Products
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-lg mb-8">
          Discover our amazing collection of {categoryName} products
        </p>
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-12">
          <div className="w-24 h-24 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-12 h-12 text-slate-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Coming Soon</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-8">
            This category page is under development. We're working hard to bring you the best {categoryName} products!
          </p>
          <button 
            onClick={() => window.history.back()}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  </div>
);

const PlaceholderPage = ({ title, description, icon }) => (
  <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-16">
    <div className="max-w-4xl mx-auto px-4">
      <div className="text-center">
        <div className="w-24 h-24 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-6">
          {icon}
        </div>
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
          {title}
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-lg mb-8">
          {description}
        </p>
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-12">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Coming Soon</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-8">
            This page is under development. We're working hard to bring you amazing features!
          </p>
          <button 
            onClick={() => window.history.back()}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  </div>
);

function App() {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  return (
    <ThemeProvider>
      <CartProvider>
        <SearchProvider>
          <CategoryProvider>
            <Router>
              <AuthProvider>
                <FavoritesProvider>
                <Navbar />
                <SecondNavbar />
                <main className="w-full min-h-[calc(100vh-4rem)]">
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/search" element={<SearchResults />} />
                    <Route path="/category/:categoryName" element={<CategoryPage categoryName="Electronics" />} />
                    <Route path="/product/:productId" element={<ProductDetails />} />
                    <Route path="/guides/:guideId" element={
                      <PlaceholderPage 
                        title="Guides" 
                        description="Helpful guides and tutorials"
                        icon={<svg className="w-12 h-12 text-slate-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>}
                      />
                    } />
                    <Route path="/catalog" element={
                      <PlaceholderPage 
                        title="Catalog" 
                        description="Browse our complete product catalog"
                        icon={<svg className="w-12 h-12 text-slate-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>}
                      />
                    } />
                    <Route path="/journal" element={
                      <PlaceholderPage 
                        title="Journal" 
                        description="Latest news and articles"
                        icon={<svg className="w-12 h-12 text-slate-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                        </svg>}
                      />
                    } />
                    <Route path="/phones" element={<CategoryPage categoryName="Phones" />} />
                    <Route path="/laptops" element={<CategoryPage categoryName="Laptops" />} />
                    <Route path="/headphones" element={<CategoryPage categoryName="Headphones" />} />
                    <Route path="/speakers" element={<CategoryPage categoryName="Speakers" />} />
                    <Route path="/smartwatches" element={<CategoryPage categoryName="Smart Watches" />} />
                    <Route path="/gaming" element={<CategoryPage categoryName="Gaming" />} />
                    <Route path="/features" element={
                      <PlaceholderPage 
                        title="Features" 
                        description="Discover our amazing features"
                        icon={<svg className="w-12 h-12 text-slate-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                        </svg>}
                      />
                    } />
                    <Route path="/products" element={<Products />} />
                    <Route path="/categories" element={
                      <PlaceholderPage 
                        title="Categories" 
                        description="Browse products by category"
                        icon={<svg className="w-12 h-12 text-slate-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>}
                      />
                    } />
                    <Route path="/about" element={<About />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/profile" element={<Profile />} />
                  </Routes>
                </main>
                <Footer />
                <Toaster 
                  position="top-right"
                  toastOptions={{
                    duration: 3000,
                    className: 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium px-4 py-3 shadow-xl',
                    success: {
                      iconTheme: {
                        primary: '#10b981',
                        secondary: '#ffffff',
                      },
                    },
                    error: {
                      iconTheme: {
                        primary: '#ef4444',
                        secondary: '#ffffff',
                      },
                    },
                  }}
                />
                </FavoritesProvider>
              </AuthProvider>
            </Router>
          </CategoryProvider>
        </SearchProvider>
      </CartProvider>
    </ThemeProvider>
  );
}

export default App;
