import React, { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import { orderManager, ORDER_STATUSES, STATUS_DESCRIPTIONS } from '../utils/orderManager';

const OrderStatus = ({ orderId, initialOrder }) => {
  const [currentOrder, setCurrentOrder] = useState(initialOrder);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Listener para actualizaciones en tiempo real
  useEffect(() => {
    const handleOrderUpdate = async () => {
      if (orderId) {
        try {
          const updatedOrder = await orderManager.getOrder(orderId);
          if (updatedOrder) {
            setCurrentOrder(updatedOrder);
            console.log('🔔 Actualización en tiempo real:', updatedOrder.status);
          }
        } catch (error) {
          console.error('Error en actualización tiempo real:', error);
        }
      }
    };

    window.addEventListener('ordersUpdated', handleOrderUpdate);
    
    return () => {
      window.removeEventListener('ordersUpdated', handleOrderUpdate);
    };
  }, [orderId]);

  // Actualizar automáticamente cada 3 segundos (más frecuente)
  useEffect(() => {
    if (!orderId) return;
    
    const updateOrder = async () => {
      try {
        const updatedOrder = await orderManager.getOrder(orderId);
        if (updatedOrder) {
          setCurrentOrder(updatedOrder);
          console.log('🔄 Estado actualizado:', updatedOrder.status);
        }
      } catch (error) {
        console.error('Error updating order:', error);
      }
    };

    // Actualizar inmediatamente
    updateOrder();
    
    // Luego cada 3 segundos
    const interval = setInterval(updateOrder, 3000);

    return () => clearInterval(interval);
  }, [orderId]);

  const handleRefresh = async () => {
    if (!orderId) return;
    
    setIsRefreshing(true);
    try {
      const updatedOrder = await orderManager.getOrder(orderId);
      if (updatedOrder) {
        setCurrentOrder(updatedOrder);
        console.log('🔄 Refresh manual - Estado:', updatedOrder.status);
      }
    } catch (error) {
      console.error('Error refreshing order:', error);
    }
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const formatDate = (dateString) => {
    return new Intl.DateTimeFormat('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateString));
  };

  const getTimelineItems = () => {
    const status = currentOrder?.status || ORDER_STATUSES.CONFIRMED;
    const createdAt = currentOrder?.createdAt || initialOrder.date;

    return [
      {
        icon: '💳',
        title: 'Pago Confirmado',
        description: 'Pago procesado exitosamente',
        timestamp: createdAt,
        completed: true,
        active: false
      },
      {
        icon: '📱',
        title: 'Código Generado',
        description: 'Código listo para validación',
        timestamp: createdAt,
        completed: true,
        active: status === ORDER_STATUSES.CONFIRMED
      },
      {
        icon: '🔄',
        title: 'Preparando Pedido',
        description: 'El cajero está preparando tu pedido',
        timestamp: status === ORDER_STATUSES.PREPARING ? currentOrder?.updatedAt : null,
        completed: ['preparing', 'ready', 'delivered'].includes(status),
        active: status === ORDER_STATUSES.PREPARING
      },
      {
        icon: '✅',
        title: 'Listo para Recoger',
        description: 'Tu pedido está listo',
        timestamp: status === ORDER_STATUSES.READY ? currentOrder?.updatedAt : null,
        completed: ['ready', 'delivered'].includes(status),
        active: status === ORDER_STATUSES.READY
      },
      {
        icon: '🎉',
        title: 'Pedido Entregado',
        description: 'Disfruta tus productos OXXO',
        timestamp: status === ORDER_STATUSES.DELIVERED ? currentOrder?.updatedAt : null,
        completed: status === ORDER_STATUSES.DELIVERED,
        active: false
      }
    ];
  };

  return (
    <div className="order-status">
      <div className="status-header">
        <h4>Estado del Pedido</h4>
        <button 
          className={`refresh-btn ${isRefreshing ? 'refreshing' : ''}`}
          onClick={handleRefresh}
          title="Actualizar estado"
        >
          <RefreshCw size={16} />
        </button>
      </div>
      
      <div className="current-status">
        <div className={`status-badge ${currentOrder?.status || ORDER_STATUSES.CONFIRMED}`}>
          {STATUS_DESCRIPTIONS[currentOrder?.status || ORDER_STATUSES.CONFIRMED]}
        </div>
        <p className="last-update">
          Última actualización: {formatDate(currentOrder?.updatedAt || initialOrder.date)}
        </p>
      </div>

      <div className="timeline">
        {getTimelineItems().map((item, index) => (
          <div key={index} className={`timeline-item ${item.completed ? 'completed' : ''} ${item.active ? 'active' : ''}`}>
            <div className="timeline-dot"></div>
            <div className="timeline-content">
              <h5>{item.icon} {item.title}</h5>
              <p>{item.description}</p>
              {item.timestamp && (
                <span className="timestamp">{formatDate(item.timestamp)}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrderStatus;