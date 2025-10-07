import React, { useState } from 'react';
import { X, Plus, Minus, Trash2, ShoppingBag, Camera } from 'lucide-react';
import AlternativeScanner from './AlternativeScanner';
import './Cart.css';

const Cart = ({ isOpen, onClose, cartItems, onUpdateQuantity, onRemoveItem, onClearCart, onCheckout, onAddToCart }) => {
  const [showScanner, setShowScanner] = useState(false);

  // Mapeo de códigos de barras a productos
  const barcodeToProduct = {
    '9789586828529': {
      id: 1,
      name: 'Coca-Cola 600ml',
      description: 'Bebida gaseosa refrescante, sabor original',
      price: 3.50,
      originalPrice: 4.00,
      image: 'https://www.wanta.pe/Multimedia/productos/detalle/COCA_COLA_SIN_AZUCAR_500_ML_202404101738539731.avif',
      category: 'Bebidas',
      isPromotion: true,
      discount: 12
    }
    // Aquí puedes agregar más códigos de barras
  };
  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
      minimumFractionDigits: 2
    }).format(price);
  };

  const handleScanSuccess = (scannedCode) => {
    console.log('📱 Código de barras escaneado:', scannedCode);
    setShowScanner(false);
    
    // Auto-buscar después de escanear con delay como el cajero
    setTimeout(() => {
      handleBarcodeScanned(scannedCode);
    }, 500);
  };

  const handleBarcodeScanned = (barcode) => {
    console.log('🔍 Procesando código:', barcode);
    
    // Buscar el producto por código de barras
    const product = barcodeToProduct[barcode];
    
    if (product) {
      console.log('✅ Producto encontrado:', product.name);
      onAddToCart(product, 1); // Agregar 1 unidad al carrito
      
      // Mostrar notificación con mejor UX
      const notification = document.createElement('div');
      notification.innerHTML = `✅ ${product.name} agregado al carrito`;
      notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #28a745;
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        z-index: 9999;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        font-weight: 600;
      `;
      document.body.appendChild(notification);
      
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 3000);
    } else {
      console.log('❌ Producto no encontrado para el código:', barcode);
      
      // Mostrar error con mejor UX
      const errorNotification = document.createElement('div');
      errorNotification.innerHTML = `❌ Código de barras no reconocido`;
      errorNotification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #dc3545;
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        z-index: 9999;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        font-weight: 600;
      `;
      document.body.appendChild(errorNotification);
      
      setTimeout(() => {
        document.body.removeChild(errorNotification);
      }, 3000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="cart-overlay">
      <div className="cart-sidebar">
        {/* Cart Header */}
        <div className="cart-header">
          <div className="cart-title">
            <ShoppingBag size={24} />
            <h2>Carrito de Compras</h2>
          </div>
          <button className="close-cart-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        {/* Cart Content */}
        <div className="cart-content">
          {cartItems.length === 0 ? (
            <div className="empty-cart">
              <ShoppingBag size={48} className="empty-cart-icon" />
              <h3>Tu carrito está vacío</h3>
              <p>Agrega productos para comenzar tu compra</p>
              
              <button 
                className="scanner-btn"
                onClick={() => setShowScanner(true)}
              >
                <Camera size={20} />
                Escanear Código de Barras
              </button>
            </div>
          ) : (
            <>
              {/* Scanner Button */}
              <div className="cart-scanner-section">
                <button 
                  className="scanner-btn-small"
                  onClick={() => setShowScanner(true)}
                >
                  <Camera size={16} />
                  Escanear más productos
                </button>
              </div>

              {/* Cart Items */}
              <div className="cart-items">
                {cartItems.map(item => (
                  <div key={item.id} className="cart-item">
                    <div className="item-image">
                      <img 
                        src={item.image} 
                        alt={item.name}
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/80x80/e30613/ffffff?text=OXXO';
                        }}
                      />
                    </div>

                    <div className="item-details">
                      <h4 className="item-name">{item.name}</h4>
                      <p className="item-category">{item.category}</p>
                      <p className="item-price">{formatPrice(item.price)}</p>
                    </div>

                    <div className="item-controls">
                      <div className="quantity-controls">
                        <button 
                          className="quantity-btn"
                          onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          <Minus size={16} />
                        </button>
                        <span className="quantity">{item.quantity}</span>
                        <button 
                          className="quantity-btn"
                          onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus size={16} />
                        </button>
                      </div>

                      <button 
                        className="remove-item-btn"
                        onClick={() => onRemoveItem(item.id)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div className="item-total">
                      {formatPrice(item.price * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Cart Summary */}
              <div className="cart-summary">
                <div className="summary-row">
                  <span>Total de productos:</span>
                  <span>{getTotalItems()} items</span>
                </div>
                <div className="summary-row">
                  <span>Subtotal:</span>
                  <span>{formatPrice(getTotalPrice())}</span>
                </div>
                <div className="summary-row">
                  <span>Delivery:</span>
                  <span className="free-delivery">GRATIS</span>
                </div>
                <div className="summary-row total-row">
                  <span>Total:</span>
                  <span>{formatPrice(getTotalPrice())}</span>
                </div>

                <div className="cart-actions">
                  <button className="clear-cart-btn" onClick={onClearCart}>
                    <Trash2 size={16} />
                    Vaciar Carrito
                  </button>
                  <button className="checkout-btn" onClick={onCheckout}>
                    Proceder al Pago
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* QR/Barcode Scanner Modal */}
      <AlternativeScanner 
        isVisible={showScanner}
        onScanSuccess={handleScanSuccess}
        onClose={() => setShowScanner(false)}
      />
    </div>
  );
};

export default Cart;