import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/context/CartContext';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import axios from 'axios';
import { toast } from 'sonner';
import { ArrowLeft, Package, CreditCard } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const PAYPAL_CLIENT_ID = process.env.REACT_APP_PAYPAL_CLIENT_ID || '';

export const CheckoutPage = () => {
  const { cart, cartId, getCartTotal } = useCart();
  const navigate = useNavigate();

  const [products, setProducts] = useState({});
  const [orderId, setOrderId] = useState(null);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [orderLocked, setOrderLocked] = useState(false);

  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: ''
  });

  // Redirect if cart empty
  useEffect(() => {
    if (!cart || !cart.items || cart.items.length === 0) {
      navigate('/');
    }
  }, [cart, navigate]);

  // Load products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get(`${API}/products`);
        const map = {};

        res.data.forEach(p => {
          map[p.id] = p;
        });

        setProducts(map);
      } catch (err) {
        console.error(err);
        toast.error('Failed to load products');
      }
    };

    fetchProducts();
  }, []);

  const handleInputChange = (e) => {
    setCustomerInfo(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const validateForm = () => {
    const required = [
      'name',
      'email',
      'address',
      'city',
      'state',
      'zipCode',
      'country'
    ];

    for (const field of required) {
      if (!customerInfo[field]?.trim()) {
        toast.error(`Please fill in ${field}`);
        return false;
      }
    }

    return true;
  };

  /**
   * IMPORTANT:
   * This runs ONCE per PayPal session
   */
  const createOrder = useCallback(async () => {
    if (orderLocked) return;

    if (!validateForm()) {
      throw new Error('Invalid form');
    }

    setOrderLocked(true);
    setIsCreatingOrder(true);

    try {
      // 1. Create backend order
      const orderRes = await axios.post(`${API}/orders/create`, {
        cart_id: cartId,
        customer_email: customerInfo.email,
        customer_name: customerInfo.name,
        shipping_address: {
          address: customerInfo.address,
          city: customerInfo.city,
          state: customerInfo.state,
          zipCode: customerInfo.zipCode,
          country: customerInfo.country
        }
      });

      const newOrderId = orderRes.data.id;
      setOrderId(newOrderId);

      // 2. Create PayPal order
      const paypalRes = await axios.post(`${API}/paypal/create-order`, {
        order_id: newOrderId,
        amount: getCartTotal()
      });

      return paypalRes.data.id;

    } catch (err) {
      console.error(err);
      toast.error('Failed to create order');
      setOrderLocked(false);
      throw err;
    } finally {
      setIsCreatingOrder(false);
    }
  }, [
    cartId,
    customerInfo,
    getCartTotal,
    orderLocked
  ]);

  const onApprove = async (data) => {
    if (!orderId) {
      toast.error('Missing order ID');
      return;
    }

    try {
      await axios.post(`${API}/paypal/capture-order`, {
        paypal_order_id: data.orderID,
        order_id: orderId
      });

      toast.success('Payment successful!');
      navigate('/order-success');

    } catch (err) {
      console.error(err);
      toast.error('Payment failed');
    }
  };

  const onError = (err) => {
    console.error(err);
    toast.error('PayPal error occurred');
  };

  if (!cart || !cart.items?.length) return null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">

      <div className="max-w-7xl mx-auto px-6 py-12">

        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 mb-8 text-slate-600"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>

        <h1 className="text-4xl font-black mb-12">
          Checkout
        </h1>

        <div className="grid lg:grid-cols-3 gap-12">

          {/* LEFT */}
          <div className="lg:col-span-2 space-y-8">

            {/* SHIPPING */}
            <div className="p-6 bg-white dark:bg-slate-900 rounded-xl">
              <div className="flex items-center gap-2 mb-4">
                <Package />
                <h2 className="text-xl font-bold">Shipping</h2>
              </div>

              <div className="grid md:grid-cols-2 gap-4">

                {[
                  'name',
                  'email',
                  'address',
                  'city',
                  'state',
                  'zipCode',
                  'country'
                ].map(field => (
                  <input
                    key={field}
                    name={field}
                    value={customerInfo[field]}
                    onChange={handleInputChange}
                    placeholder={field}
                    className="p-3 border rounded"
                  />
                ))}

              </div>
            </div>

            {/* PAYMENT */}
            <div className="p-6 bg-white dark:bg-slate-900 rounded-xl">
              <div className="flex items-center gap-2 mb-4">
                <CreditCard />
                <h2 className="text-xl font-bold">Payment</h2>
              </div>

              {PAYPAL_CLIENT_ID ? (
                <PayPalScriptProvider
                  options={{ 'client-id': PAYPAL_CLIENT_ID }}
                >
                  <PayPalButtons
                    createOrder={createOrder}
                    onApprove={onApprove}
                    onError={onError}
                  />
                </PayPalScriptProvider>
              ) : (
                <p className="text-yellow-500">
                  PayPal not configured
                </p>
              )}
            </div>

          </div>

          {/* RIGHT */}
          <div className="p-6 bg-white dark:bg-slate-900 rounded-xl h-fit">

            <h2 className="text-xl font-bold mb-4">
              Order Summary
            </h2>

            {cart.items.map((item, i) => {
              const product = products[item.product_id];
              if (!product) return null;

              return (
                <div key={i} className="flex justify-between mb-3">
                  <span>{product.name}</span>
                  <span>${item.price * item.quantity}</span>
                </div>
              );
            })}

            <hr className="my-4" />

            <div className="flex justify-between font-bold">
              <span>Total</span>
              <span>${getCartTotal().toFixed(2)}</span>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};
