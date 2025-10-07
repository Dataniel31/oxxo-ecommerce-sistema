import React, { useState } from 'react';
import { MapPin, Clock, CheckCircle } from 'lucide-react';
import './PaymentCash.css';

const PaymentCash = ({ totalAmount, onPaymentSuccess }) => {
  const [selectedStore, setSelectedStore] = useState('');
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    address: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);

  const oxxoStores = [
    {
      id: 'store1',
      name: 'OXXO San Isidro Centro',
      address: 'Av. Larco 345, San Isidro',
      distance: '0.8 km',
      hours: '24 horas'
    },
    {
      id: 'store2',
      name: 'OXXO Miraflores',
      address: 'Av. Pardo 567, Miraflores', 
      distance: '1.2 km',
      hours: '6:00 AM - 12:00 AM'
    },
    {
      id: 'store3',
      name: 'OXXO La Molina',
      address: 'Av. Javier Prado 890, La Molina',
      distance: '2.1 km', 
      hours: '24 horas'
    }
  ];

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
      minimumFractionDigits: 2
    }).format(price);
  };

  const handleInputChange = (field, value) => {
    setCustomerInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleConfirmOrder = () => {
    if (!selectedStore || !customerInfo.name || !customerInfo.phone) {
      alert('Por favor completa todos los campos requeridos');
      return;
    }

    setIsProcessing(true);

    // Simular proceso de confirmación
    setTimeout(() => {
      const paymentData = {
        method: 'cash',
        store: oxxoStores.find(store => store.id === selectedStore),
        customerInfo,
        estimatedTime: '30-45 minutos'
      };

      onPaymentSuccess(paymentData);
      setIsProcessing(false);
    }, 2000);
  };

  return (
    <div className="payment-cash">
      <div className="cash-header">
        <h3>Pago en Efectivo</h3>
        <p>Selecciona una tienda OXXO para recoger tu pedido y pagar en efectivo</p>
      </div>

      {/* Customer Information */}
      <div className="customer-section">
        <h4>Información del Cliente</h4>
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="customer-name">Nombre Completo *</label>
            <input
              id="customer-name"
              type="text"
              value={customerInfo.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Ingresa tu nombre completo"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="customer-phone">Teléfono *</label>
            <input
              id="customer-phone"
              type="tel"
              value={customerInfo.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="999 123 456"
              required
            />
          </div>
          
          <div className="form-group full-width">
            <label htmlFor="customer-address">Dirección (Opcional)</label>
            <input
              id="customer-address"
              type="text"
              value={customerInfo.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              placeholder="Dirección de referencia"
            />
          </div>
        </div>
      </div>

      {/* Store Selection */}
      <div className="store-section">
        <h4>Selecciona tu tienda OXXO</h4>
        <div className="stores-list">
          {oxxoStores.map(store => (
            <div
              key={store.id}
              className={`store-card ${selectedStore === store.id ? 'selected' : ''}`}
              onClick={() => setSelectedStore(store.id)}
            >
              <div className="store-info">
                <h5>{store.name}</h5>
                <div className="store-details">
                  <div className="store-detail">
                    <MapPin size={16} />
                    <span>{store.address}</span>
                  </div>
                  <div className="store-detail">
                    <Clock size={16} />
                    <span>{store.hours}</span>
                  </div>
                </div>
                <div className="store-distance">
                  {store.distance}
                </div>
              </div>
              
              {selectedStore === store.id && (
                <div className="selected-indicator">
                  <CheckCircle size={24} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Payment Summary */}
      <div className="payment-summary">
        <div className="summary-row">
          <span>Total a pagar:</span>
          <span className="total-amount">{formatPrice(totalAmount)}</span>
        </div>
        <div className="summary-info">
          <p>• Tu pedido estará listo en 30-45 minutos</p>
          <p>• Paga en efectivo al recoger tu pedido</p>
          <p>• Recibirás una confirmación por SMS</p>
        </div>
      </div>

      {/* Confirm Button */}
      <button
        className="confirm-cash-btn"
        onClick={handleConfirmOrder}
        disabled={isProcessing || !selectedStore || !customerInfo.name || !customerInfo.phone}
      >
        {isProcessing ? (
          <span className="processing">
            <div className="spinner"></div>
            Procesando pedido...
          </span>
        ) : (
          'Confirmar Pedido'
        )}
      </button>
    </div>
  );
};

export default PaymentCash;