import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/context/CartContext';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import axios from 'axios';
import { toast } from 'sonner';
import { ArrowLeft, Package, CreditCard } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const PAYPAL_CLIENT_ID = process.env.REACT_APP_PAYPAL_CLIENT_ID;

export const CheckoutPage = () => {
  const { cart, cartId, getCartTotal } = useCart();
  const navigate = useNavigate();

  const [products, setProducts] = useState({});
  const [orderId, setOrderId] = useState(null);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);

  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: ''
  });

  useEffect(() => {
    if (!cart || !cart.items || cart.items.length === 0) {
      navigate('/');
      return;
    }
    fetchProducts();
  }, [cart]);

  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${API}/products`);
      const map = {};
      res.data.forEach(p => (map[p.id] = p));
      setProducts(map);
    } catch (err) {
      console.error('Product fetch failed:', err);
      toast.error('Failed to load products');
    }
  };

  const handleInputChange = (e) => {
    setCustomerInfo(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const validateForm = () => {
    const required = Object.keys(customerInfo);
    for (let field of required) {
      if (!customerInfo[field]?.trim()) {
        toast.error(`Please fill in ${field}`);
        return false;
      }
    }
    return true;
  };

  const createOrder = async () => {
    if (!validateForm()) throw new Error('Invalid form');

    setIsCreatingOrder(true);

    try {
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

      const paypalRes = await axios.post(`${API}/paypal/create-order`, {
        order_id: newOrderId,
        amount: getCartTotal()
      });

      return paypalRes.data.id;

    } catch (err) {
      console.error(err);
      toast.error('Order creation failed');
      throw err;
    } finally {
      setIsCreatingOrder(false);
    }
  };

  const onApprove = async (data) => {
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

  const onError = () => {
    toast.error('PayPal error occurred');
  };

  if (!cart || !cart.items?.length) return null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-6 py-12">

        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-slate-500 hover:text-purple-500 mb-8"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>

        <h1 className="text-4xl font-black mb-10">Checkout</h1>

        <div className="grid lg:grid-cols-3 gap-10">

          {/* LEFT */}
          <div className="lg:col-span-2 space-y-8">

            {/* SHIPPING */}
            <div className="p-6 bg-white dark:bg-slate-900 rounded-xl">
              <div className="flex items-center gap-2 mb-4">
                <Package className="w-5 h-5 text-purple-500" />
                <h2 className="font-bold text-xl">Shipping</h2>
              </div>

              <div className="grid md:grid-cols-2 gap-4">

                {Object.keys(customerInfo).map((key) => (
                  <input
                    key={key}
                    name={key}
                    value={customerInfo[key]}
                    onChange={handleInputChange}
                    placeholder={key}
                    className="p-3 rounded-lg bg-slate-100 dark:bg-slate-800"
                  />
                ))}

              </div>
            </div>

            {/* PAYMENT */}
            <div className="p-6 bg-white dark:bg-slate-900 rounded-xl">
              <div className="flex items-center gap-2 mb-4">
                <CreditCard className="w-5 h-5 text-purple-500" />
                <h2 className="font-bold text-xl">Payment</h2>
              </div>

              {!PAYPAL_CLIENT_ID ? (
                <p className="text-yellow-500">
                  PayPal not configured
                </p>
              ) : (
                <PayPalScriptProvider options={{ 'client-id': PAYPAL_CLIENT_ID }}>
                  <PayPalButtons
                    createOrder={createOrder}
                    onApprove={onApprove}
                    onError={onError}
                  />
                </PayPalScriptProvider>
              )}
            </div>

          </div>

          {/* RIGHT */}
          <div className="p-6 bg-white dark:bg-slate-900 rounded-xl">
            <h2 className="font-bold text-xl mb-4">Summary</h2>

            {cart.items.map((item, i) => {
              const product = products[item.product_id];
              if (!product) return null;

              return (
                <div key={i} className="flex justify-between text-sm mb-3">
                  <span>{product.name}</span>
                  <span>${item.price * item.quantity}</span>
                </div>
              );
            })}

            <hr className="my-4" />

            <div className="font-bold flex justify-between">
              <span>Total</span>
              <span>${getCartTotal().toFixed(2)}</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
