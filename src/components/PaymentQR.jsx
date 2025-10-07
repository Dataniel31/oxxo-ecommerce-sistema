import React, { useState, useEffect } from 'react';
import { Smartphone, Clock, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import './PaymentQR.css';

const PaymentQR = ({ totalAmount, onPaymentSuccess }) => {
  const [selectedApp, setSelectedApp] = useState('yape');
  const [qrCode, setQrCode] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('waiting'); // waiting, checking, success, failed
  const [timeRemaining, setTimeRemaining] = useState(600); // 10 minutos
  const [checkingPayment, setCheckingPayment] = useState(false);

  const paymentApps = [
    {
      id: 'yape',
      name: 'Yape',
      logo: '🟣',
      color: '#7b1fa2',
      description: 'Pago rápido con código QR'
    },
    {
      id: 'plin',
      name: 'Plin',
      logo: '🔵', 
      color: '#1976d2',
      description: 'Transferencia inmediata con QR'
    }
  ];

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
      minimumFractionDigits: 2
    }).format(price);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Generar QR Code simulado
  useEffect(() => {
    const generateQR = () => {
      const qrData = `${selectedApp}-pay-${totalAmount}-${Date.now()}`;
      // Simular URL de QR code
      setQrCode(`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData)}&bgcolor=ffffff&color=000000`);
    };

    generateQR();
  }, [selectedApp, totalAmount]);

  // Contador de tiempo
  useEffect(() => {
    if (timeRemaining > 0 && paymentStatus === 'waiting') {
      const timer = setTimeout(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeRemaining === 0) {
      setPaymentStatus('failed');
    }
  }, [timeRemaining, paymentStatus]);

  const handleCheckPayment = () => {
    setCheckingPayment(true);
    setPaymentStatus('checking');

    // Simular verificación de pago (100% de éxito para demo)
    setTimeout(() => {
      // Siempre exitoso para esta demo
      setPaymentStatus('success');
      
      const paymentData = {
        method: selectedApp,
        transactionId: selectedApp.toUpperCase() + Date.now().toString().slice(-8),
        timestamp: new Date(),
        amount: totalAmount,
        qrData: qrCode
      };

      // Esperar un poco antes de confirmar para mostrar el estado de éxito
      setTimeout(() => {
        onPaymentSuccess(paymentData);
      }, 2000);
      
      setCheckingPayment(false);
    }, 2000); // Reducido a 2 segundos para mejor UX
  };

  const handleRetry = () => {
    setPaymentStatus('waiting');
    setTimeRemaining(600);
    setCheckingPayment(false);
  };

  return (
    <div className="payment-qr">
      <div className="qr-header">
        <h3>Pago con QR - DEMO</h3>
        <p>Simulador de pago con Yape/Plin - No se realizará transacción real</p>
      </div>

      {/* App Selection */}
      <div className="app-selection">
        <h4>Selecciona tu app de pago:</h4>
        <div className="apps-grid">
          {paymentApps.map(app => (
            <button
              key={app.id}
              className={`app-btn ${selectedApp === app.id ? 'selected' : ''}`}
              onClick={() => setSelectedApp(app.id)}
              style={{ '--app-color': app.color }}
            >
              <span className="app-logo">{app.logo}</span>
              <div className="app-info">
                <span className="app-name">{app.name}</span>
                <span className="app-desc">{app.description}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Payment Amount */}
      <div className="payment-amount">
        <h4>Monto a pagar:</h4>
        <span className="amount">{formatPrice(totalAmount)}</span>
      </div>

      {/* QR Code Section */}
      <div className="qr-section">
        {paymentStatus === 'waiting' && (
          <>
            <div className="qr-container">
              <img src={qrCode} alt="Código QR para pago" className="qr-image" />
              <div className="qr-overlay">
                <div className="selected-app-badge" style={{ backgroundColor: paymentApps.find(app => app.id === selectedApp)?.color }}>
                  {paymentApps.find(app => app.id === selectedApp)?.logo} {paymentApps.find(app => app.id === selectedApp)?.name}
                </div>
              </div>
            </div>

            <div className="timer-section">
              <Clock size={20} />
              <span>Tiempo restante: {formatTime(timeRemaining)}</span>
            </div>

            <div className="instructions">
              <h5>Instrucciones:</h5>
              <ol>
                <li>Abre tu app {paymentApps.find(app => app.id === selectedApp)?.name}</li>
                <li>Selecciona la opción "Pagar con QR"</li>
                <li>Escanea el código QR mostrado arriba</li>
                <li>Confirma el monto de {formatPrice(totalAmount)}</li>
                <li>Haz clic en "Comprobar Pago" cuando hayas completado el pago</li>
              </ol>
            </div>

            <div className="demo-notice">
              <div className="demo-icon">🎭</div>
              <div className="demo-text">
                <strong>MODO DEMO:</strong> Este es un simulador. Al hacer clic en "Comprobar Pago" 
                el pago será automáticamente confirmado sin realizar transacción real.
              </div>
            </div>

            <button
              className="check-payment-btn"
              onClick={handleCheckPayment}
              disabled={checkingPayment}
            >
              {checkingPayment ? (
                <span className="processing">
                  <div className="spinner"></div>
                  Verificando pago...
                </span>
              ) : (
                <>
                  <CheckCircle size={20} />
                  Comprobar Pago
                </>
              )}
            </button>
          </>
        )}

        {paymentStatus === 'checking' && (
          <div className="status-screen checking">
            <div className="status-icon">
              <div className="checking-spinner"></div>
            </div>
            <h4>Verificando tu pago...</h4>
            <p>Por favor espera mientras confirmamos tu transacción</p>
          </div>
        )}

        {paymentStatus === 'success' && (
          <div className="status-screen success">
            <div className="status-icon">
              <CheckCircle size={64} />
            </div>
            <h4>¡Pago confirmado!</h4>
            <p>Tu pago ha sido procesado exitosamente</p>
            <div className="success-details">
              <p><strong>Método:</strong> {paymentApps.find(app => app.id === selectedApp)?.name}</p>
              <p><strong>Monto:</strong> {formatPrice(totalAmount)}</p>
            </div>
          </div>
        )}

        {paymentStatus === 'failed' && (
          <div className="status-screen failed">
            <div className="status-icon">
              <AlertCircle size={64} />
            </div>
            <h4>Pago no detectado</h4>
            <p>No hemos recibido confirmación de tu pago. Intenta nuevamente.</p>
            <button className="retry-btn" onClick={handleRetry}>
              <RefreshCw size={20} />
              Intentar nuevamente
            </button>
          </div>
        )}
      </div>

      {paymentStatus === 'waiting' && (
        <div className="security-note">
          <p>🔒 Tu pago está protegido. No compartas este código QR.</p>
          <p>💡 El código QR expirará en {formatTime(timeRemaining)}</p>
        </div>
      )}
    </div>
  );
};

export default PaymentQR;