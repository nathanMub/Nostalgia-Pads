import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import { CartProvider } from '@/context/CartContext';
import { ThemeProvider } from '@/context/ThemeContext';

import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { CartDrawer } from '@/components/CartDrawer';
import { Toaster } from 'sonner';

import '@/App.css';

// Lazy-loaded pages (performance upgrade)
const HomePage = lazy(() => import('@/pages/HomePage'));
const CollectionsPage = lazy(() => import('@/pages/CollectionsPage'));
const CollectionPage = lazy(() => import('@/pages/CollectionPage'));
const ProductPage = lazy(() => import('@/pages/ProductPage'));
const CheckoutPage = lazy(() => import('@/pages/CheckoutPage'));
const OrderSuccessPage = lazy(() => import('@/pages/OrderSuccessPage'));

function App() {
  return (
    <ThemeProvider>
      <CartProvider>

        <BrowserRouter>

          <div className="App min-h-screen flex flex-col">

            <Header />

            {/* MAIN CONTENT */}
            <main className="flex-1">

              <Suspense
                fallback={
                  <div className="min-h-screen flex items-center justify-center">
                    <div className="animate-spin w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full" />
                  </div>
                }
              >

                <Routes>

                  <Route path="/" element={<HomePage />} />
                  <Route path="/collections" element={<CollectionsPage />} />
                  <Route path="/collection/:slug" element={<CollectionPage />} />
                  <Route path="/product/:slug" element={<ProductPage />} />
                  <Route path="/checkout" element={<CheckoutPage />} />
                  <Route path="/order-success" element={<OrderSuccessPage />} />

                </Routes>

              </Suspense>

            </main>

            <Footer />

            <CartDrawer />

            <Toaster position="top-right" richColors />

          </div>

        </BrowserRouter>

      </CartProvider>
    </ThemeProvider>
  );
}

export default App;
