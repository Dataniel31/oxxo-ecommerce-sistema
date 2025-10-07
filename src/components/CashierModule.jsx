import React, { useState, useEffect } from 'react';
import { Search, Check, X, Package, User, Clock, AlertTriangle, CheckCircle, LogOut, RefreshCw, Camera, Settings } from 'lucide-react';
import { orderManager, ORDER_STATUSES, STATUS_DESCRIPTIONS } from '../utils/orderManager';
import CashierLogin from './CashierLogin';
import AlternativeScanner from './AlternativeScanner';
import './CashierModuleResponsive.css';

const CashierModule = () => {
  const [searchCode, setSearchCode] = useState('');
  const [validationResult, setValidationResult] = useState(null);
  const [isValidating, setIsValidating] = useState(false);
  const [loggedInCashier, setLoggedInCashier] = useState(null);
  const [lastSyncTime, setLastSyncTime] = useState(Date.now());
  const [orderHistory, setOrderHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showScanner, setShowScanner] = useState(false);

  // Cargar historial de órdenes al iniciar
  useEffect(() => {
    loadOrderHistory();
  }, []);

  // Configurar sincronización automática
  useEffect(() => {
    // Listener para actualizaciones de órdenes
    const handleOrdersUpdate = () => {
      console.log('🔄 Actualizando cajero - nuevas órdenes detectadas');
      setLastSyncTime(Date.now());
      loadOrderHistory(); // Recargar historial cuando hay cambios
    };

    window.addEventListener('ordersUpdated', handleOrdersUpdate);
    
    // Auto-refresh cada 5 segundos
    const interval = setInterval(() => {
      orderManager.getAllOrders(); // Esto fuerza la sincronización
      loadOrderHistory(); // Actualizar historial regularmente
    }, 5000);

    return () => {
      window.removeEventListener('ordersUpdated', handleOrdersUpdate);
      clearInterval(interval);
    };
  }, []);

  const loadOrderHistory = async () => {
    try {
      const orders = await orderManager.getAllOrders();
      const ordersArray = Object.values(orders).sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      setOrderHistory(ordersArray);
    } catch (error) {
      console.warn('Error cargando historial:', error);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
      minimumFractionDigits: 2
    }).format(price);
  };

  const handleLogin = (cashierData) => {
    setLoggedInCashier(cashierData);
    console.log('✅ Cajero logueado:', cashierData);
  };

  const handleLogout = () => {
    setLoggedInCashier(null);
    setValidationResult(null);
    setSearchCode('');
    console.log('👋 Cajero deslogueado');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !isValidating) {
      handleSearch();
    }
  };

  const handleScanSuccess = (scannedCode) => {
    console.log('📱 Código escaneado:', scannedCode);
    setSearchCode(scannedCode);
    setShowScanner(false);
    
    // Auto-buscar después de escanear
    setTimeout(() => {
      handleSearchWithCode(scannedCode);
    }, 500);
  };

  const handleSearchWithCode = async (code = searchCode) => {
    if (!code.trim()) {
      alert('Por favor ingresa un código de orden');
      return;
    }

    setIsValidating(true);
    
    try {
      console.log('🔍 Buscando orden en servidor:', code.toUpperCase());
      
      // Buscar la orden en el servidor
      const order = await orderManager.getOrder(code.toUpperCase());
      
      if (order) {
        console.log('✅ Orden encontrada:', order);
        
        // Actualizar estado a preparando si aún está confirmado
        if (order.status === ORDER_STATUSES.CONFIRMED) {
          await orderManager.updateOrderStatus(order.id, ORDER_STATUSES.PREPARING, `El cajero ${loggedInCashier.name} está preparando tu pedido`);
          // Obtener la orden actualizada
          const updatedOrder = await orderManager.getOrder(order.id);
          setValidationResult({
            success: true,
            order: updatedOrder,
            message: `✅ Orden encontrada - Iniciando preparación`
          });
        } else if (order.status === ORDER_STATUSES.PREPARING) {
          setValidationResult({
            success: true,
            order: order,
            message: `🔄 Orden en preparación - Marcar como listo cuando termine`
          });
        } else if (order.status === ORDER_STATUSES.READY) {
          setValidationResult({
            success: true,
            order: order,
            message: `📦 Orden lista - Entregar al cliente`
          });
        } else if (order.status === ORDER_STATUSES.DELIVERED) {
          setValidationResult({
            success: true,
            order: order,
            message: `🎉 Orden ya entregada - Completada exitosamente`
          });
        } else {
          setValidationResult({
            success: true,
            order: order,
            message: `Estado actual: ${STATUS_DESCRIPTIONS[order.status] || 'Desconocido'}`
          });
        }
        
        // Recargar historial después de cualquier cambio
        loadOrderHistory();
      } else {
        console.log('❌ Orden no encontrada');
        setValidationResult({
          success: false,
          message: 'Código de orden no encontrado o inválido'
        });
      }
    } catch (error) {
      console.error('Error al buscar orden:', error);
      setValidationResult({
        success: false,
        message: 'Error al validar la orden. Intenta de nuevo.'
      });
    } finally {
      setIsValidating(false);
    }
  };

  const handleSearch = () => {
    handleSearchWithCode(searchCode);
  };

  const handleMarkReady = async () => {
    try {
      if (validationResult && validationResult.success && validationResult.order) {
        const orderId = validationResult.order.id;
        await orderManager.updateOrderStatus(orderId, ORDER_STATUSES.READY, `Pedido listo para recoger - Preparado por ${loggedInCashier.name}`);
        
        // Actualizar el resultado local para reflejar el cambio
        const updatedOrder = await orderManager.getOrder(orderId);
        setValidationResult({
          ...validationResult,
          order: updatedOrder,
          message: `📦 Orden lista - Entregar al cliente cuando venga`
        });
        
        // Recargar historial
        loadOrderHistory();
      }
    } catch (error) {
      console.error('Error al marcar como listo:', error);
      alert('Error al actualizar el estado de la orden');
    }
  };

  const handleConfirmDelivery = async () => {
    try {
      if (validationResult && validationResult.success && validationResult.order) {
        const orderId = validationResult.order.id;
        await orderManager.updateOrderStatus(orderId, ORDER_STATUSES.DELIVERED, `Pedido entregado al cliente - Confirmado por ${loggedInCashier.name}`);
        
        // Actualizar el resultado local para reflejar el cambio
        const updatedOrder = await orderManager.getOrder(orderId);
        setValidationResult({
          ...validationResult,
          order: updatedOrder,
          message: `✅ Pedido entregado exitosamente - Orden completada`
        });
        
        // Recargar historial
        loadOrderHistory();
        
        // Limpiar formulario después de 3 segundos
        setTimeout(() => {
          setValidationResult(null);
          setSearchCode('');
        }, 3000);
      }
    } catch (error) {
      console.error('Error al confirmar entrega:', error);
      alert('Error al confirmar la entrega de la orden');
    }
  };

  if (!loggedInCashier) {
    return <CashierLogin onLogin={handleLogin} />;
  }

  return (
    <div className="cashier-responsive">
      {/* Header - Mobile Optimized */}
      <div className="header-mobile">
        <div className="store-info">
          <h1>OXXO - Cajero</h1>
          <p>San Isidro Centro</p>
        </div>
        
        <div className="cashier-info">
          <div className="sync-status">
            <RefreshCw size={16} />
            <span>{new Date(lastSyncTime).toLocaleTimeString()}</span>
          </div>
          
          <div className="cashier-details">
            <User size={16} />
            <span>{loggedInCashier.name}</span>
          </div>
          
          <div className="header-actions">
            <button onClick={() => loadOrderHistory()} className="btn-refresh">
              <Clock size={16} />
            </button>
            <button onClick={handleLogout} className="btn-logout">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </div>

      <div className="main-container">
        {/* Search Section */}
        <div className="search-section-mobile">
          <div className="section-header">
            <h2>Validar Pago de Cliente</h2>
            <p>Escanea o ingresa el código de orden</p>
          </div>
          
          {/* Input Group */}
          <div className="input-group-mobile">
            <div className="input-row">
              <div className="input-container">
                <Search className="input-icon" size={20} />
                <input
                  type="text"
                  placeholder="Código OXXO (ej: OXXO12345678)"
                  value={searchCode}
                  onChange={(e) => setSearchCode(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={isValidating}
                  className="search-input-mobile"
                />
              </div>
              
              <button 
                onClick={() => setShowScanner(true)}
                disabled={isValidating}
                className="btn-scanner-mobile"
              >
                <Camera size={24} />
                <span className="scanner-text">Escanear</span>
              </button>
            </div>
            
            <button 
              onClick={handleSearch}
              disabled={isValidating}
              className="btn-search-mobile"
            >
              {isValidating ? (
                <>
                  <RefreshCw className="spin" size={20} />
                  <span>Buscando...</span>
                </>
              ) : (
                <>
                  <Search size={20} />
                  <span>Buscar Orden</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Results Section */}
        {validationResult && (
          <div className={`result-section-mobile ${validationResult.success ? 'success' : 'error'}`}>
            <div className="result-header">
              <div className="result-icon">
                {validationResult.success ? (
                  <CheckCircle size={32} />
                ) : (
                  <X size={32} />
                )}
              </div>
              
              <div className="result-content">
                <h3>
                  {validationResult.success 
                    ? (validationResult.order?.status === ORDER_STATUSES.CONFIRMED 
                        ? '✅ Orden Encontrada' 
                        : validationResult.order?.status === ORDER_STATUSES.PREPARING
                        ? '🔄 En Preparación'
                        : validationResult.order?.status === ORDER_STATUSES.READY
                        ? '📦 Lista para Entregar'
                        : validationResult.order?.status === ORDER_STATUSES.DELIVERED
                        ? '🎉 Orden Entregada'
                        : '✅ Orden Válida')
                    : '❌ Orden No Encontrada'
                  }
                </h3>
                <p>{validationResult.message}</p>
              </div>
            </div>

            {/* Order Details */}
            {validationResult.success && validationResult.order && (
              <div className="order-details-mobile">
                <div className="order-info-grid">
                  <div className="info-item">
                    <span className="label">Cliente:</span>
                    <span className="value">{validationResult.order.customerName}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Orden:</span>
                    <span className="value code">{validationResult.order.id}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Estado:</span>
                    <span className="value">{STATUS_DESCRIPTIONS[validationResult.order.status]}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Total:</span>
                    <span className="value price">{formatPrice(validationResult.order.total)}</span>
                  </div>
                </div>

                {/* Products */}
                {validationResult.order.items && validationResult.order.items.length > 0 && (
                  <div className="products-mobile">
                    <h4>Productos a Entregar</h4>
                    <div className="products-list">
                      {validationResult.order.items.map((item, index) => (
                        <div key={index} className="product-item-mobile">
                          <div className="product-info">
                            <span className="product-name">{item.name}</span>
                            <span className="product-qty">Qty: {item.quantity}</span>
                          </div>
                          <span className="product-price">{formatPrice(item.price * item.quantity)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                {validationResult.order.status === ORDER_STATUSES.PREPARING && (
                  <button
                    onClick={handleMarkReady}
                    className="btn-ready-mobile"
                  >
                    <Package size={20} />
                    <span>Marcar como Listo</span>
                  </button>
                )}
                
                {validationResult.order.status === ORDER_STATUSES.READY && (
                  <button
                    onClick={handleConfirmDelivery}
                    className="btn-deliver-mobile"
                  >
                    <CheckCircle size={20} />
                    <span>Confirmar Entrega</span>
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Order History */}
        <div className="history-section-mobile">
          <div className="section-header">
            <h3>Historial de Órdenes</h3>
            <button onClick={() => loadOrderHistory()} className="btn-refresh-small">
              <RefreshCw size={16} />
            </button>
          </div>
          
          <div className="history-list">
            {orderHistory.map((order) => (
              <div key={order.id} className="history-item-mobile">
                <div className="history-header">
                  <span className="order-code">{order.id}</span>
                  <span className={`status-badge ${order.status}`}>
                    {STATUS_DESCRIPTIONS[order.status]}
                  </span>
                </div>
                <div className="history-details">
                  <span className="customer">{order.customerName}</span>
                  <span className="total">{formatPrice(order.total)}</span>
                </div>
                <div className="history-time">
                  {new Date(order.timestamp).toLocaleString()}
                </div>
              </div>
            ))}
            {orderHistory.length === 0 && (
              <p className="no-orders">No hay órdenes disponibles</p>
            )}
          </div>
        </div>
      </div>

      {/* QR Scanner Modal */}
      <AlternativeScanner 
        isVisible={showScanner}
        onScanSuccess={handleScanSuccess}
        onClose={() => setShowScanner(false)}
      />
    </div>
  );
};

export default CashierModule;