import React, { createContext, useContext, useState, useEffect } from 'react';

// Crear el contexto
const OrderContext = createContext();

// Hook personalizado para usar el contexto
export const useOrders = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrders debe ser usado dentro de OrderProvider');
  }
  return context;
};

// Estados posibles de una orden
export const ORDER_STATUSES = {
  CONFIRMED: 'confirmed',      // Pago confirmado, esperando preparación
  PREPARING: 'preparing',      // En preparación
  READY: 'ready',             // Listo para recoger
  DELIVERED: 'delivered',      // Entregado al cliente
  CANCELLED: 'cancelled'       // Cancelado
};

// Descripciones de estados para mostrar al usuario
export const STATUS_DESCRIPTIONS = {
  [ORDER_STATUSES.CONFIRMED]: 'Pago confirmado - Preparando pedido',
  [ORDER_STATUSES.PREPARING]: 'Preparando tu pedido',
  [ORDER_STATUSES.READY]: 'Listo para recoger en tienda',
  [ORDER_STATUSES.DELIVERED]: 'Pedido entregado',
  [ORDER_STATUSES.CANCELLED]: 'Pedido cancelado'
};

// Proveedor del contexto
export const OrderProvider = ({ children }) => {
  const [orders, setOrders] = useState(() => {
    // Cargar órdenes del localStorage al inicializar
    const savedOrders = localStorage.getItem('oxxo_orders');
    return savedOrders ? JSON.parse(savedOrders) : {};
  });

  // Guardar en localStorage cada vez que cambien las órdenes
  useEffect(() => {
    localStorage.setItem('oxxo_orders', JSON.stringify(orders));
  }, [orders]);

  // Crear una nueva orden
  const createOrder = (orderData) => {
    const orderId = orderData.id;
    const newOrder = {
      ...orderData,
      status: ORDER_STATUSES.CONFIRMED,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      statusHistory: [
        {
          status: ORDER_STATUSES.CONFIRMED,
          timestamp: new Date().toISOString(),
          description: 'Pago confirmado exitosamente'
        }
      ]
    };

    setOrders(prev => ({
      ...prev,
      [orderId]: newOrder
    }));

    return newOrder;
  };

  // Actualizar el estado de una orden
  const updateOrderStatus = (orderId, newStatus, description = '') => {
    setOrders(prev => {
      const existingOrder = prev[orderId];
      if (!existingOrder) {
        console.error(`Orden ${orderId} no encontrada`);
        return prev;
      }

      const updatedOrder = {
        ...existingOrder,
        status: newStatus,
        updatedAt: new Date().toISOString(),
        statusHistory: [
          ...existingOrder.statusHistory,
          {
            status: newStatus,
            timestamp: new Date().toISOString(),
            description: description || STATUS_DESCRIPTIONS[newStatus]
          }
        ]
      };

      return {
        ...prev,
        [orderId]: updatedOrder
      };
    });
  };

  // Obtener una orden por ID
  const getOrder = (orderId) => {
    return orders[orderId] || null;
  };

  // Obtener todas las órdenes
  const getAllOrders = () => {
    return Object.values(orders);
  };

  // Obtener órdenes por estado
  const getOrdersByStatus = (status) => {
    return Object.values(orders).filter(order => order.status === status);
  };

  // Verificar si una orden existe
  const orderExists = (orderId) => {
    return Boolean(orders[orderId]);
  };

  // Eliminar una orden (para casos especiales)
  const deleteOrder = (orderId) => {
    setOrders(prev => {
      const newOrders = { ...prev };
      delete newOrders[orderId];
      return newOrders;
    });
  };

  // Limpiar todas las órdenes (para desarrollo/testing)
  const clearAllOrders = () => {
    setOrders({});
    localStorage.removeItem('oxxo_orders');
  };

  const value = {
    orders,
    createOrder,
    updateOrderStatus,
    getOrder,
    getAllOrders,
    getOrdersByStatus,
    orderExists,
    deleteOrder,
    clearAllOrders,
    ORDER_STATUSES,
    STATUS_DESCRIPTIONS
  };

  return (
    <OrderContext.Provider value={value}>
      {children}
    </OrderContext.Provider>
  );
};

export default OrderContext;