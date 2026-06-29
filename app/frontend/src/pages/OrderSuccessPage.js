import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle, Home, Package } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export const OrderSuccessPage = () => {
  const { cart, clearCart } = useCart();
  const navigate = useNavigate();

  // Clear cart when user lands here
  useEffect(() => {
    clearCart?.();
  }, [clearCart]);

  // Safety: if user lands here with no context, still allow view
  useEffect(() => {
    if (cart && cart.items?.length > 0) {
      clearCart?.();
    }
  }, [cart, clearCart]);

  return (
    <div className="min-h-screen flex items-center justify-center px-6">

      <div className="max-w-md w-full text-center">

        {/* ICON */}
        <div className="mb-6 flex justify-center">
          <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
        </div>

        {/* TITLE */}
        <h1 className="text-4xl font-black mb-4">
          Order Successful!
        </h1>

        {/* MESSAGE */}
        <p className="text-slate-600 dark:text-slate-400 mb-8">
          Your nostalgic mousepad is on its way to bring childhood memories back to your desk.
        </p>

        {/* INFO BOX */}
        <div className="p-6 bg-slate-50 dark:bg-slate-900 rounded-2xl mb-8">

          <div className="flex items-center justify-center gap-3 text-sm text-slate-600">

            <Package className="w-5 h-5" />

            <p>
              You’ll receive a confirmation email shortly with tracking details.
            </p>

          </div>

        </div>

        {/* BUTTON */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-8 py-4 bg-purple-500 text-white font-bold rounded-full hover:scale-105 transition"
        >
          <Home className="w-5 h-5" />
          Continue Shopping
        </Link>

      </div>

    </div>
  );
};
