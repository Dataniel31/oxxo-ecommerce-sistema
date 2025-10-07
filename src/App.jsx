import React, { useState, useEffect } from 'react';
import { orderManager } from './utils/orderManager';
import Header from './components/Header';
import CategoryFilter from './components/CategoryFilter';
import ProductGrid from './components/ProductGrid';
import Cart from './components/Cart';
import Checkout from './components/Checkout';
import './App.css';

// Mock data for products
const mockProducts = [
  {
    id: 1,
    name: 'Coca-Cola 600ml',
    description: 'Bebida gaseosa refrescante, sabor original',
    price: 3.50,
    originalPrice: 4.00,
    image: 'https://www.wanta.pe/Multimedia/productos/detalle/COCA_COLA_SIN_AZUCAR_500_ML_202404101738539731.avif',
    category: 'Bebidas',
    isPromotion: true,
    discount: 12
  },
  {
    id: 2,
    name: 'Doritos Nacho 150g',
    description: 'Tortilla chips con sabor a queso nacho',
    price: 4.90,
    image: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=200&h=200&fit=crop&crop=center',
    category: 'Snacks',
    isPromotion: false
  },
  {
    id: 3,
    name: 'Aceite Primor 1L',
    description: 'Aceite vegetal comestible de soya',
    price: 8.50,
    image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=200&h=200&fit=crop&crop=center',
    category: 'Despensa',
    isPromotion: false
  },
  {
    id: 4,
    name: 'Inka Kola 500ml',
    description: 'La bebida del sabor nacional del Perú',
    price: 3.20,
    originalPrice: 3.80,
    image: 'https://images.unsplash.com/photo-1581636625402-29b2a704ef13?w=200&h=200&fit=crop&crop=center',
    category: 'Bebidas',
    isPromotion: true,
    discount: 15
  },
  {
    id: 5,
    name: 'Pringles Original 124g',
    description: 'Papas fritas apilables sabor original',
    price: 7.90,
    image: 'https://images.unsplash.com/photo-1613919113640-25732ec5e61f?w=200&h=200&fit=crop&crop=center',
    category: 'Snacks',
    isPromotion: false
  },
  {
    id: 6,
    name: 'Shampoo Head & Shoulders 400ml',
    description: 'Shampoo anticaspa para cabello graso',
    price: 12.50,
    image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=200&h=200&fit=crop&crop=center',
    category: 'Cuidado Personal',
    isPromotion: false
  },
  {
    id: 7,
    name: 'Leche Gloria Evaporada 410g',
    description: 'Leche evaporada entera, ideal para postres',
    price: 4.20,
    image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=200&h=200&fit=crop&crop=center',
    category: 'Despensa',
    isPromotion: false
  },
  {
    id: 8,
    name: 'Galletas Oreo 432g',
    description: 'Galletas de chocolate rellenas de crema',
    price: 9.90,
    originalPrice: 12.50,
    image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=200&h=200&fit=crop&crop=center',
    category: 'Snacks',
    isPromotion: true,
    discount: 20
  }
];

// Categories with icons
const categories = [
  { id: 'bebidas', name: 'Bebidas', icon: '🥤', count: 2 },
  { id: 'snacks', name: 'Snacks', icon: '🍿', count: 3 },
  { id: 'despensa', name: 'Despensa', icon: '🥫', count: 2 },
  { id: 'cuidado personal', name: 'Cuidado Personal', icon: '🧴', count: 1 }
];

function App() {
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('todos');

  // Calculate cart items count
  const getCartItemsCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  // Handle adding items to cart
  const handleAddToCart = (product, quantityChange = 1) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      
      if (existingItem) {
        const newQuantity = existingItem.quantity + quantityChange;
        if (newQuantity <= 0) {
          return prevCart.filter(item => item.id !== product.id);
        }
        return prevCart.map(item =>
          item.id === product.id
            ? { ...item, quantity: newQuantity }
            : item
        );
      } else if (quantityChange > 0) {
        return [...prevCart, { ...product, quantity: quantityChange }];
      }
      
      return prevCart;
    });
  };

  // Handle cart operations
  const handleUpdateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      handleRemoveItem(productId);
      return;
    }
    
    setCart(prevCart =>
      prevCart.map(item =>
        item.id === productId
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  const handleRemoveItem = (productId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  const handleCartClick = () => {
    setIsCartOpen(true);
  };

  const handleCloseCart = () => {
    setIsCartOpen(false);
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
  };

  const handleCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleCloseCheckout = () => {
    setIsCheckoutOpen(false);
  };

  const handleOrderSuccess = (orderData) => {
    // Crear la orden en el sistema de gestión
    orderManager.createOrder(orderData);
    
    // Limpiar carrito después de una orden exitosa
    setCart([]);
    // NO cerrar el checkout aquí para permitir ver la confirmación
    // El checkout se cerrará desde el componente OrderConfirmation
  };

  const getTotalAmount = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  return (
    <div className="App">
      <Header 
        cartItemsCount={getCartItemsCount()}
        onCartClick={handleCartClick}
      />
      
      <main className="main-content">
        <CategoryFilter 
          categories={categories}
          selectedCategory={selectedCategory}
          onCategoryChange={handleCategoryChange}
        />
        
        <div className="container">
          <ProductGrid 
            products={mockProducts}
            onAddToCart={handleAddToCart}
            cart={cart}
            searchTerm={searchTerm}
            selectedCategory={selectedCategory}
          />
        </div>
      </main>

      <Cart 
        isOpen={isCartOpen}
        onClose={handleCloseCart}
        cartItems={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
        onCheckout={handleCheckout}
        onAddToCart={handleAddToCart}
      />

      <Checkout
        isOpen={isCheckoutOpen}
        onClose={handleCloseCheckout}
        cartItems={cart}
        totalAmount={getTotalAmount()}
        onOrderSuccess={handleOrderSuccess}
      />
    </div>
  );
}

export default App;
