import React, { useEffect, useRef } from 'react';
import { CheckCircle, Package, Clock, Download, Share2, QrCode } from 'lucide-react';
import QRCode from 'qrcode';
import OrderStatus from './OrderStatus';
import './OrderConfirmation.css';

const OrderConfirmation = ({ orderData, onClose }) => {
  const qrCanvasRef = useRef(null);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
      minimumFractionDigits: 2
    }).format(price);
  };

  const formatDate = (date) => {
    return new Intl.DateTimeFormat('es-PE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  // Generar QR Code automáticamente
  useEffect(() => {
    if (qrCanvasRef.current && orderData?.id) {
      // El código QR contendrá solo el ID de la orden para el escáner
      QRCode.toCanvas(qrCanvasRef.current, orderData.id, {
        width: 200,
        margin: 2,
        color: {
          dark: '#dc143c', // Color OXXO rojo
          light: '#ffffff'
        }
      }, (error) => {
        if (error) console.error('Error generando QR:', error);
        else console.log('✅ QR Code generado correctamente');
      });
    }
  }, [orderData?.id]);

  const generateOrderQR = () => {
    const orderInfo = `OXXO-ORDER-${orderData.id}-${orderData.total}`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(orderInfo)}&bgcolor=ffffff&color=000000`;
  };

  const generateBarcode = () => {
    // Simular código de barras con el ID de la orden
    const barcodeData = orderData.id.replace('OXXO', '');
    return `https://barcode.tec-it.com/barcode.ashx?data=${barcodeData}&code=Code128&dpi=96&unit=Fit&resize=false&download=false`;
  };

  const getPaymentMethodName = () => {
    switch (orderData.paymentMethod) {
      case 'cash':
        return 'Efectivo';
      case 'card':
        return 'Tarjeta';
      case 'yape':
        return 'Yape';
      case 'plin':
        return 'Plin';
      default:
        return 'Método de Pago';
    }
  };



  const getEstimatedDelivery = () => {
    const deliveryTime = new Date();
    if (orderData.paymentMethod === 'cash') {
      deliveryTime.setMinutes(deliveryTime.getMinutes() + 45);
    } else {
      deliveryTime.setMinutes(deliveryTime.getMinutes() + 30);
    }
    return deliveryTime;
  };

  const handleDownload = () => {
    // Simular descarga de comprobante
    alert('Descargando comprobante de pago...');
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('📋 Código copiado al portapapeles');
    }).catch(err => {
      console.error('Error copiando:', err);
      // Fallback para navegadores antiguos
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('📋 Código copiado al portapapeles');
    });
  };

  const handleShare = () => {
    // Simular compartir orden
    if (navigator.share) {
      navigator.share({
        title: 'Mi pedido OXXO',
        text: `Pedido ${orderData.id} por ${formatPrice(orderData.total)}`,
        url: window.location.href
      });
    } else {
      // Fallback para navegadores que no soportan Web Share API
      navigator.clipboard.writeText(`Pedido OXXO ${orderData.id} - ${formatPrice(orderData.total)}`);
      alert('Información del pedido copiada al portapapeles');
    }
  };

  return (
    <div className="order-confirmation">
      {/* Success Header */}
      <div className="success-header">
        <div className="success-icon">
          <CheckCircle size={64} />
        </div>
        <h2>¡Pedido Confirmado!</h2>
        <p>Tu pago ha sido procesado exitosamente. Dirígete a la tienda para recoger tus productos.</p>
      </div>

      {/* Order Details */}
      <div className="order-details">
        <div className="order-header">
          <h3>Detalles del Pedido</h3>
          <div className="order-id">#{orderData.id}</div>
        </div>

        <div className="order-info-grid">
          <div className="info-card">
            <div className="info-header">
              <Package size={20} />
              <span>Productos</span>
            </div>
            <div className="products-list">
              {orderData.items.map(item => (
                <div key={item.id} className="product-item">
                  <span className="product-name">{item.name}</span>
                  <span className="product-quantity">x{item.quantity}</span>
                  <span className="product-price">{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="total-row">
              <span>Total:</span>
              <span className="total-amount">{formatPrice(orderData.total)}</span>
            </div>
          </div>

          <div className="info-card">
            <div className="info-header">
              <Clock size={20} />
              <span>Información de Recojo</span>
            </div>
            <div className="delivery-info">
              <p><strong>Método de Pago:</strong> {getPaymentMethodName()}</p>
              <p><strong>Fecha del Pedido:</strong> {formatDate(orderData.date)}</p>
              <p><strong>Listo para Recoger:</strong> {formatDate(getEstimatedDelivery())}</p>
              
              {orderData.paymentMethod === 'cash' && orderData.paymentData.store && (
                <div className="store-info">
                  <p><strong>Tienda de Recojo:</strong></p>
                  <p>{orderData.paymentData.store.name}</p>
                  <p>{orderData.paymentData.store.address}</p>
                </div>
              )}
              
              {orderData.paymentData.transactionId && (
                <p><strong>ID Transacción:</strong> {orderData.paymentData.transactionId}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* QR and Barcode */}
      <div className="codes-section">
        <h4>
          <QrCode size={24} />
          Códigos de Verificación
        </h4>
        <div className="codes-container">
          <div className="code-item featured">
            <h5>🎯 Código QR OXXO</h5>
            <div className="qr-container">
              <canvas ref={qrCanvasRef} className="qr-code-canvas"></canvas>
            </div>
            <p className="qr-instruction">
              📱 <strong>Escanea este código</strong> en el módulo cajero de OXXO
            </p>
          </div>
          
          <div className="code-item">
            <h5>📋 Código Manual</h5>
            <div className="manual-code">
              <code className="order-code-display">{orderData.id}</code>
              <button 
                className="copy-code-btn"
                onClick={() => copyToClipboard(orderData.id)}
              >
                📋 Copiar
              </button>
            </div>
            <p>� O dicta este código al cajero si no tienes escáner</p>
          </div>
        </div>
        
        <div className="pickup-instructions">
          <h4>📋 Instrucciones para Recoger:</h4>
          <ol>
            <li>Ve a cualquier tienda OXXO</li>
            <li>Busca los productos en la tienda</li>
            <li>Dirígete al cajero o módulo de validación</li>
            <li>Muestra tu código QR o menciona tu número de orden</li>
            <li>El cajero validará tu pago y te dará tu boleta</li>
            <li>¡Llévate tus productos!</li>
          </ol>
        </div>
      </div>

      {/* Actions */}
      <div className="order-actions">
        <button className="action-btn secondary" onClick={handleDownload}>
          <Download size={18} />
          Descargar Comprobante
        </button>
        
        <button className="action-btn secondary" onClick={handleShare}>
          <Share2 size={18} />
          Compartir Pedido
        </button>
        
        <button className="action-btn primary" onClick={onClose}>
          Continuar Comprando
        </button>
      </div>

      {/* Status Timeline */}
      <div className="status-timeline">
        <OrderStatus orderId={orderData.id} initialOrder={orderData} />
      </div>

      {/* Contact Info */}
      <div className="contact-info">
        <h4>¿Necesitas Ayuda?</h4>
        <p>📞 Línea de atención: (01) 311-4040</p>
        <p>📧 Email: ayuda@oxxo.pe</p>
        <p>💬 Chat en línea disponible 24/7</p>
      </div>
    </div>
  );
};

export default OrderConfirmation;