import React, { useState, useEffect } from 'react';
import ProductCard from './ProductCard';
import './ProductGrid.css';

const ProductGrid = ({ products, onAddToCart, cart, searchTerm, selectedCategory }) => {
  const [filteredProducts, setFilteredProducts] = useState(products);

  useEffect(() => {
    let filtered = products;

    // Filter by category
    if (selectedCategory && selectedCategory !== 'todos') {
      filtered = filtered.filter(product => 
        product.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredProducts(filtered);
  }, [products, searchTerm, selectedCategory]);

  const getCartQuantity = (productId) => {
    const cartItem = cart.find(item => item.id === productId);
    return cartItem ? cartItem.quantity : 0;
  };

  if (filteredProducts.length === 0) {
    return (
      <div className="no-products">
        <h3>No se encontraron productos</h3>
        <p>Intenta con otros términos de búsqueda o cambia la categoría</p>
      </div>
    );
  }

  return (
    <div className="product-grid-container">
      <div className="products-header">
        <h2>
          {selectedCategory && selectedCategory !== 'todos' 
            ? `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}`
            : 'Todos los productos'
          }
        </h2>
        <span className="products-count">
          {filteredProducts.length} productos encontrados
        </span>
      </div>
      
      <div className="product-grid">
        {filteredProducts.map(product => (
          <ProductCard
            key={product.id}
            product={product}
            onAddToCart={onAddToCart}
            cartQuantity={getCartQuantity(product.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default ProductGrid;