import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/NavbarMain/NavbarMain";
import SecondNavbar from "./components/SecondNavbar/SecondNavbar";
import "./App.css";
import "./index.css";
import "./i18n"; // Initialize i18n
import HomePage from "./pages/HomePage/HomePage";
import Cart from "./pages/Cart/Cart";
import SearchResults from "./pages/SearchResults/SearchResults";
import ProductDetails from "./pages/ProductDetails/ProductDetails";
import Products from "./pages/Products/Products";
import Footer from "./components/Footer/Footer";
import { CartProvider } from "./context/CartContext";
import { SearchProvider } from "./context/SearchContext";
import { Toaster } from "react-hot-toast";
import ExclusiveOffers from "./pages/ExclusiveOffers/ExclusiveOffers";

function App() {
  return (
    <CartProvider>
      <SearchProvider>
        <Router>
          <div className="min-h-screen w-full bg-[var(--background-color)] text-[var(--text-color)]">
            <Navbar />
            <SecondNavbar />
            <main className="w-full min-h-[calc(100vh-4rem)]">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/search" element={<SearchResults />} />
                <Route
                  path="/category/:categoryName"
                  element={
                    <div className="text-center mt-8">Category Page</div>
                  }
                />
                <Route
                  path="/product/:productId"
                  element={<ProductDetails />}
                />
                <Route
                  path="/guides/:guideId"
                  element={<div className="text-center mt-8">Guide Page</div>}
                />
                <Route
                  path="/catalog"
                  element={<div className="text-center mt-8">Catalog Page</div>}
                />
                <Route
                  path="/journal"
                  element={<div className="text-center mt-8">Journal Page</div>}
                />
                <Route
                  path="/phones"
                  element={<div className="text-center mt-8">Phones Page</div>}
                />
                <Route
                  path="/laptops"
                  element={<div className="text-center mt-8">Laptops Page</div>}
                />
                <Route
                  path="/headphones"
                  element={
                    <div className="text-center mt-8">Headphones Page</div>
                  }
                />
                <Route
                  path="/speakers"
                  element={
                    <div className="text-center mt-8">Speakers Page</div>
                  }
                />
                <Route
                  path="/smartwatches"
                  element={
                    <div className="text-center mt-8">Smart Watches Page</div>
                  }
                />
                <Route
                  path="/gaming"
                  element={<div className="text-center mt-8">Gaming Page</div>}
                />
                <Route
                  path="/features"
                  element={
                    <div className="text-center mt-8">Features Page</div>
                  }
                />
                <Route path="/products" element={<Products />} />
                <Route path="/exclusive-offers" element={<ExclusiveOffers />} />
                <Route
                  path="/categories"
                  element={
                    <div className="text-center mt-8">Categories Page</div>
                  }
                />
                <Route
                  path="/about"
                  element={<div className="text-center mt-8">About Page</div>}
                />
                <Route
                  path="/contact"
                  element={<div className="text-center mt-8">Contact Page</div>}
                />
                <Route
                  path="/login"
                  element={<div className="text-center mt-8">Login Page</div>}
                />
                <Route
                  path="/signup"
                  element={<div className="text-center mt-8">Sign Up Page</div>}
                />
              </Routes>
            </main>
            <Footer />
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 3000,
                style: {
                  background: "var(--card-bg, #ffffff)",
                  color: "var(--text-color, #1a202c)",
                  border: "1px solid var(--border-color, #e2e8f0)",
                  borderRadius: "12px",
                  fontSize: "14px",
                  fontWeight: "500",
                  padding: "12px 16px",
                  boxShadow: "0 10px 25px rgba(0, 0, 0, 0.15)",
                },
                success: {
                  iconTheme: {
                    primary: "#10b981",
                    secondary: "#ffffff",
                  },
                },
                error: {
                  iconTheme: {
                    primary: "#ef4444",
                    secondary: "#ffffff",
                  },
                },
              }}
            />
          </div>
        </Router>
      </SearchProvider>
    </CartProvider>
  );
}

export default App;
