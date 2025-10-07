import React, { useState } from 'react';
import { CreditCard, Lock, AlertCircle, CheckCircle } from 'lucide-react';
import './PaymentCard.css';

const PaymentCard = ({ totalAmount, onPaymentSuccess }) => {
  const [cardData, setCardData] = useState({
    number: '',
    name: '',
    expiry: '',
    cvv: '',
    email: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState({});

  // Credenciales de prueba
  const testCredentials = {
    card: '4532 1234 5678 9012',
    name: 'JUAN PEREZ LOPEZ',
    expiry: '12/28',
    cvv: '123',
    email: 'test@oxxo.pe'
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
      minimumFractionDigits: 2
    }).format(price);
  };

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiry = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const handleInputChange = (field, value) => {
    let formattedValue = value;

    if (field === 'number') {
      formattedValue = formatCardNumber(value);
    } else if (field === 'expiry') {
      formattedValue = formatExpiry(value);
    } else if (field === 'cvv') {
      formattedValue = value.replace(/[^0-9]/gi, '').substring(0, 4);
    } else if (field === 'name') {
      formattedValue = value.toUpperCase();
    }

    setCardData(prev => ({
      ...prev,
      [field]: formattedValue
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!cardData.number || cardData.number.replace(/\s/g, '').length < 13) {
      newErrors.number = 'Número de tarjeta inválido';
    }

    if (!cardData.name || cardData.name.length < 3) {
      newErrors.name = 'Nombre del titular requerido';
    }

    if (!cardData.expiry || cardData.expiry.length !== 5) {
      newErrors.expiry = 'Fecha de vencimiento inválida';
    }

    if (!cardData.cvv || cardData.cvv.length < 3) {
      newErrors.cvv = 'CVV inválido';
    }

    if (!cardData.email || !cardData.email.includes('@')) {
      newErrors.email = 'Email inválido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getCardType = (number) => {
    const cleanNumber = number.replace(/\s/g, '');
    if (cleanNumber.startsWith('4')) return 'visa';
    if (cleanNumber.startsWith('5') || cleanNumber.startsWith('2')) return 'mastercard';
    if (cleanNumber.startsWith('3')) return 'amex';
    return 'unknown';
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsProcessing(true);

    // Simular procesamiento de pago
    setTimeout(() => {
      // Simular éxito/error basado en credenciales de prueba
      const isValidCard = cardData.number === testCredentials.card && 
                         cardData.cvv === testCredentials.cvv;

      if (isValidCard) {
        const paymentData = {
          method: 'card',
          cardType: getCardType(cardData.number),
          lastFourDigits: cardData.number.slice(-4),
          transactionId: 'TXN' + Date.now().toString().slice(-8),
          authCode: Math.random().toString(36).substring(2, 8).toUpperCase()
        };

        onPaymentSuccess(paymentData);
      } else {
        setErrors({ 
          general: 'Pago rechazado. Usa las credenciales de prueba proporcionadas.' 
        });
      }
      
      setIsProcessing(false);
    }, 3000);
  };

  const fillTestData = () => {
    setCardData(testCredentials);
  };

  return (
    <div className="payment-card">
      <div className="card-header">
        <h3>Pago con Tarjeta</h3>
        <div className="security-badge">
          <Lock size={16} />
          <span>Pago seguro SSL</span>
        </div>
      </div>

      {/* Test Credentials Alert */}
      <div className="test-credentials">
        <div className="test-header">
          <AlertCircle size={20} />
          <h4>Credenciales de Prueba</h4>
        </div>
        <div className="test-data">
          <p><strong>Tarjeta:</strong> {testCredentials.card}</p>
          <p><strong>Titular:</strong> {testCredentials.name}</p>
          <p><strong>Vencimiento:</strong> {testCredentials.expiry}</p>
          <p><strong>CVV:</strong> {testCredentials.cvv}</p>
          <p><strong>Email:</strong> {testCredentials.email}</p>
        </div>
        <button 
          type="button" 
          className="fill-test-btn"
          onClick={fillTestData}
        >
          Rellenar datos de prueba
        </button>
      </div>

      {errors.general && (
        <div className="error-message general-error">
          <AlertCircle size={16} />
          {errors.general}
        </div>
      )}

      <form className="card-form" onSubmit={handleSubmit}>
        {/* Card Number */}
        <div className="form-group">
          <label htmlFor="card-number">Número de Tarjeta</label>
          <div className="card-input-container">
            <input
              id="card-number"
              type="text"
              value={cardData.number}
              onChange={(e) => handleInputChange('number', e.target.value)}
              placeholder="1234 5678 9012 3456"
              maxLength="19"
              className={errors.number ? 'error' : ''}
            />
            <div className="card-type-icon">
              <CreditCard size={20} />
            </div>
          </div>
          {errors.number && (
            <span className="error-text">{errors.number}</span>
          )}
        </div>

        {/* Card Holder Name */}
        <div className="form-group">
          <label htmlFor="card-name">Nombre del Titular</label>
          <input
            id="card-name"
            type="text"
            value={cardData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="NOMBRE COMO APARECE EN LA TARJETA"
            className={errors.name ? 'error' : ''}
          />
          {errors.name && (
            <span className="error-text">{errors.name}</span>
          )}
        </div>

        {/* Expiry and CVV */}
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="card-expiry">Vencimiento</label>
            <input
              id="card-expiry"
              type="text"
              value={cardData.expiry}
              onChange={(e) => handleInputChange('expiry', e.target.value)}
              placeholder="MM/YY"
              maxLength="5"
              className={errors.expiry ? 'error' : ''}
            />
            {errors.expiry && (
              <span className="error-text">{errors.expiry}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="card-cvv">CVV</label>
            <input
              id="card-cvv"
              type="text"
              value={cardData.cvv}
              onChange={(e) => handleInputChange('cvv', e.target.value)}
              placeholder="123"
              maxLength="4"
              className={errors.cvv ? 'error' : ''}
            />
            {errors.cvv && (
              <span className="error-text">{errors.cvv}</span>
            )}
          </div>
        </div>

        {/* Email */}
        <div className="form-group">
          <label htmlFor="card-email">Email para confirmación</label>
          <input
            id="card-email"
            type="email"
            value={cardData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            placeholder="tu@email.com"
            className={errors.email ? 'error' : ''}
          />
          {errors.email && (
            <span className="error-text">{errors.email}</span>
          )}
        </div>

        {/* Payment Summary */}
        <div className="payment-summary">
          <div className="summary-row">
            <span>Total a pagar:</span>
            <span className="total-amount">{formatPrice(totalAmount)}</span>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="pay-btn"
          disabled={isProcessing}
        >
          {isProcessing ? (
            <span className="processing">
              <div className="spinner"></div>
              Procesando pago...
            </span>
          ) : (
            <>
              <Lock size={18} />
              Pagar {formatPrice(totalAmount)}
            </>
          )}
        </button>
      </form>

      <div className="security-info">
        <p>🔒 Tus datos están protegidos con encriptación SSL de 256 bits</p>
        <p>💳 Aceptamos Visa, Mastercard y American Express</p>
      </div>
    </div>
  );
};

export default PaymentCard;