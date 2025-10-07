import React from 'react';
import { Plus, Minus, ShoppingCart } from 'lucide-react';
import './ProductCard.css';

const ProductCard = ({ product, onAddToCart, cartQuantity = 0 }) => {
  const handleAddToCart = () => {
    onAddToCart(product);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
      minimumFractionDigits: 2
    }).format(price);
  };

  return (
    <div className="product-card">
      {/* Product Image */}
      <div className="product-image-container">
        <img 
          src={product.image} 
          alt={product.name}
          className="product-image"
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/200x200/e30613/ffffff?text=OXXO';
          }}
        />
        {product.isPromotion && (
          <div className="promotion-badge">
            ¡OFERTA!
          </div>
        )}
        {product.discount && (
          <div className="discount-badge">
            -{product.discount}%
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="product-info">
        <h3 className="product-name">{product.name}</h3>
        <p className="product-description">{product.description}</p>
        
        {/* Price Section */}
        <div className="price-section">
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="original-price">{formatPrice(product.originalPrice)}</span>
          )}
          <span className="current-price">{formatPrice(product.price)}</span>
        </div>

        {/* Product Category */}
        <div className="product-category">
          <span className="category-tag">{product.category}</span>
        </div>

        {/* Add to Cart Section */}
        <div className="add-to-cart-section">
          {cartQuantity > 0 ? (
            <div className="quantity-controls">
              <button 
                className="quantity-btn minus"
                onClick={() => onAddToCart(product, -1)}
              >
                <Minus size={16} />
              </button>
              <span className="quantity">{cartQuantity}</span>
              <button 
                className="quantity-btn plus"
                onClick={() => onAddToCart(product, 1)}
              >
                <Plus size={16} />
              </button>
            </div>
          ) : (
            <button 
              className="add-to-cart-btn"
              onClick={handleAddToCart}
            >
              <ShoppingCart size={18} />
              Agregar al carrito
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;