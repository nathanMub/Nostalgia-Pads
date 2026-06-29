import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import { CartProvider } from '@/context/CartContext';
import { ThemeProvider } from '@/context/ThemeContext';

import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { CartDrawer } from '@/components/CartDrawer';

import { HomePage } from '@/pages/HomePage';
import { CollectionsPage } from '@/pages/CollectionsPage';
import { CollectionPage } from '@/pages/CollectionPage';
import { ProductPage } from '@/pages/ProductPage';
import { CheckoutPage } from '@/pages/CheckoutPage';
import { OrderSuccessPage } from '@/pages/OrderSuccessPage';

import { Toaster } from 'sonner';
import '@/App.css';

function App() {
  return (
    <ThemeProvider>
      <CartProvider>
        <BrowserRouter>
          <div className="App min-h-screen flex flex-col transition-colors duration-500">

            <Header />

            <main className="flex-1">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/collections" element={<CollectionsPage />} />
                <Route path="/collection/:slug" element={<CollectionPage />} />
                <Route path="/product/:slug" element={<ProductPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/order-success" element={<OrderSuccessPage />} />
              </Routes>
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
