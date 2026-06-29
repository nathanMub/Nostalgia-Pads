import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';

const CartContext = createContext();

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState({ items: [] });
  const [cartId, setCartId] = useState(null);
  const [loading, setLoading] = useState(false);

  // INIT CART
  useEffect(() => {
    initCart();
  }, []);

  const initCart = async () => {
    try {
      setLoading(true);

      const storedCartId = localStorage.getItem('cart_id');

      if (storedCartId) {
        const res = await axios.get(`${API}/cart/${storedCartId}`);
        setCart(res.data || { items: [] });
        setCartId(storedCartId);
      } else {
        const res = await axios.post(`${API}/cart/create`);
        const newCartId = res.data.id;

        localStorage.setItem('cart_id', newCartId);
        setCartId(newCartId);
        setCart({ items: [] });
      }
    } catch (err) {
      console.error('Cart init error:', err);
      setCart({ items: [] });
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (product, size, quantity = 1) => {
    if (!cartId) {
      toast.error('Cart not ready');
      return;
    }

    try {
      setLoading(true);

      const payload = {
        product_id: product.id,
        size,
        quantity,
        price: product.price
      };

      const res = await axios.post(`${API}/cart/${cartId}/add`, payload);

      setCart(res.data);

      toast.success('Added to cart');

    } catch (err) {
      console.error('Add to cart error:', err);
      toast.error('Failed to add item');
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      setLoading(true);

      const res = await axios.delete(`${API}/cart/${cartId}/item/${itemId}`);

      setCart(res.data);

    } catch (err) {
      console.error('Remove error:', err);
      toast.error('Failed to remove item');
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    try {
      setCart({ items: [] });
    } catch (err) {
      console.error(err);
    }
  };

  const getCartTotal = () => {
    if (!cart?.items?.length) return 0;

    return cart.items.reduce((sum, item) => {
      return sum + (item.price || 0) * (item.quantity || 1);
    }, 0);
  };

  const getCartCount = () => {
    if (!cart?.items?.length) return 0;

    return cart.items.reduce((sum, item) => sum + (item.quantity || 1), 0);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        cartId,
        loading,
        addToCart,
        removeFromCart,
        clearCart,
        getCartTotal,
        getCartCount
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
