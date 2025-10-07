import React, { useState } from 'react';
import { X, CreditCard, Banknote, Smartphone, ArrowLeft } from 'lucide-react';
import PaymentCash from './PaymentCash';
import PaymentCard from './PaymentCard';
import PaymentQR from './PaymentQR';
import OrderConfirmation from './OrderConfirmation';
import { orderManager } from '../utils/orderManager';
import './Checkout.css';

const Checkout = ({ isOpen, onClose, cartItems, totalAmount, onOrderSuccess }) => {
  const [currentStep, setCurrentStep] = useState('payment-method'); // payment-method, payment-process, order-confirmation
  const [selectedPayment, setSelectedPayment] = useState('');
  const [orderData, setOrderData] = useState(null);

  const paymentMethods = [
    {
      id: 'cash',
      name: 'Efectivo',
      icon: <Banknote size={32} />,
      description: 'Paga en efectivo al recibir tu pedido',
      color: '#28a745'
    },
    {
      id: 'card',
      name: 'Tarjeta de Crédito/Débito',
      icon: <CreditCard size={32} />,
      description: 'Visa, Mastercard, American Express',
      color: '#007bff'
    },
    {
      id: 'qr',
      name: 'Yape / Plin',
      icon: <Smartphone size={32} />,
      description: 'Pago rápido con código QR',
      color: '#6f42c1'
    }
  ];

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
      minimumFractionDigits: 2
    }).format(price);
  };

  const handlePaymentMethodSelect = (methodId) => {
    setSelectedPayment(methodId);
    setCurrentStep('payment-process');
  };

  const handlePaymentSuccess = async (paymentData) => {
    try {
      // Crear datos de la orden
      const orderData = {
        items: cartItems,
        total: totalAmount,
        paymentMethod: selectedPayment,
        paymentData,
        date: new Date().toISOString()
      };
      
      // Registrar la orden usando OrderManager
      const createdOrder = await orderManager.createOrder(orderData);
      
      console.log('✅ Orden registrada exitosamente:', createdOrder.id);
      
      setOrderData(createdOrder);
      setCurrentStep('order-confirmation');
      
      // Notificar al componente padre sobre el éxito de la orden
      if (onOrderSuccess) {
        onOrderSuccess(createdOrder);
      }
    } catch (error) {
      console.error('❌ Error al crear la orden:', error);
      alert('Error al procesar la orden. Por favor intenta nuevamente.');
    }
  };

  const handleBackToMethods = () => {
    setCurrentStep('payment-method');
    setSelectedPayment('');
  };

  const handleClose = () => {
    setCurrentStep('payment-method');
    setSelectedPayment('');
    setOrderData(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="checkout-overlay">
      <div className="checkout-modal">
        {/* Header */}
        <div className="checkout-header">
          <div className="header-content">
            {currentStep !== 'payment-method' && (
              <button className="back-btn" onClick={handleBackToMethods}>
                <ArrowLeft size={24} />
              </button>
            )}
            <h2>
              {currentStep === 'payment-method' && 'Método de Pago'}
              {currentStep === 'payment-process' && 'Procesar Pago'}
              {currentStep === 'order-confirmation' && 'Orden Confirmada'}
            </h2>
            <button className="close-btn" onClick={handleClose}>
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="checkout-content">
          {currentStep === 'payment-method' && (
            <div className="payment-methods">
              <div className="order-summary">
                <h3>Resumen del Pedido</h3>
                <div className="summary-items">
                  {cartItems.map(item => (
                    <div key={item.id} className="summary-item">
                      <span>{item.name} x{item.quantity}</span>
                      <span>{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
                <div className="summary-total">
                  <strong>Total: {formatPrice(totalAmount)}</strong>
                </div>
              </div>

              <div className="methods-grid">
                {paymentMethods.map(method => (
                  <div
                    key={method.id}
                    className="payment-method-card"
                    onClick={() => handlePaymentMethodSelect(method.id)}
                    style={{ '--method-color': method.color }}
                  >
                    <div className="method-icon">
                      {method.icon}
                    </div>
                    <h4>{method.name}</h4>
                    <p>{method.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentStep === 'payment-process' && (
            <div className="payment-process">
              {selectedPayment === 'cash' && (
                <PaymentCash
                  totalAmount={totalAmount}
                  onPaymentSuccess={handlePaymentSuccess}
                />
              )}
              {selectedPayment === 'card' && (
                <PaymentCard
                  totalAmount={totalAmount}
                  onPaymentSuccess={handlePaymentSuccess}
                />
              )}
              {selectedPayment === 'qr' && (
                <PaymentQR
                  totalAmount={totalAmount}
                  onPaymentSuccess={handlePaymentSuccess}
                />
              )}
            </div>
          )}

          {currentStep === 'order-confirmation' && (
            <OrderConfirmation
              orderData={orderData}
              onClose={handleClose}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Checkout;