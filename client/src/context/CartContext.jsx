import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { cartService } from '../services/cartService.js';
import { useToast } from './ToastContext.jsx';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const stored = localStorage.getItem('aura_cart');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifiedCart, setVerifiedCart] = useState(null);
  const { showToast } = useToast();

  // Save to localStorage on changes
  useEffect(() => {
    localStorage.setItem('aura_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product, quantity = 1) => {
    if (!product || !product.id) return;

    if (product.stock_quantity <= 0) {
      showToast(`"${product.title}" is currently out of stock.`, 'error');
      return;
    }

    const existingItem = cartItems.find((item) => item.id === product.id);

    if (existingItem) {
      const newQty = Math.min(existingItem.quantity + quantity, product.stock_quantity);
      if (newQty === existingItem.quantity) {
        showToast(`Maximum stock limit (${product.stock_quantity}) reached for this item.`, 'info');
        return;
      }
      setCartItems((prevItems) =>
        prevItems.map((item) =>
          item.id === product.id ? { ...item, quantity: newQty } : item
        )
      );
      showToast(`Updated quantity for "${product.title}" (${newQty})`, 'success');
    } else {
      const initialQty = Math.min(quantity, product.stock_quantity);
      setCartItems((prevItems) => [
        ...prevItems,
        {
          id: product.id,
          slug: product.slug,
          title: product.title,
          price: Number(product.price),
          image_url: product.image_url,
          category_name: product.category_name,
          stock_quantity: product.stock_quantity,
          quantity: initialQty
        }
      ]);
      showToast(`Added "${product.title}" to cart`, 'success');
    }

    setIsCartOpen(true);
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }

    const item = cartItems.find((it) => it.id === productId);
    if (item && newQuantity > item.stock_quantity) {
      showToast(`Limited to available stock (${item.stock_quantity})`, 'info');
    }

    setCartItems((prev) =>
      prev.map((it) =>
        it.id === productId
          ? { ...it, quantity: Math.min(newQuantity, it.stock_quantity) }
          : it
      )
    );
  };

  const removeFromCart = (productId) => {
    setCartItems((prev) => prev.filter((item) => item.id !== productId));
    showToast('Item removed from cart', 'info');
  };

  const clearCart = () => {
    setCartItems([]);
    setVerifiedCart(null);
  };

  const verifyWithBackend = async () => {
    if (cartItems.length === 0) return null;
    setIsVerifying(true);
    try {
      const data = await cartService.verifyCart(cartItems);
      setVerifiedCart(data);

      if (data.warnings && data.warnings.length > 0) {
        data.warnings.forEach((warn) => showToast(warn, 'info'));
      }
      return data;
    } catch (err) {
      console.error('Cart verification failed:', err);
      showToast('Could not verify cart prices with server.', 'error');
      return null;
    } finally {
      setIsVerifying(false);
    }
  };

  const subtotal = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  }, [cartItems]);

  const itemCount = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + item.quantity, 0);
  }, [cartItems]);

  const freeShippingThreshold = 250;
  const freeShippingProgress = Math.min(100, (subtotal / freeShippingThreshold) * 100);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        isCartOpen,
        setIsCartOpen,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        subtotal,
        itemCount,
        freeShippingThreshold,
        freeShippingProgress,
        verifyWithBackend,
        verifiedCart,
        isVerifying
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
