// Sistema de órdenes compartidas simulando sincronización entre dispositivos
class SharedOrderStorage {
  constructor() {
    // Usar múltiples claves para simular sincronización
    this.keys = [
      'oxxo_orders_shared',
      'oxxo_orders_sync',
      'oxxo_network_orders'
    ];
    this.initializeSharedStorage();
  }

  initializeSharedStorage() {
    // Inicializar todas las claves si no existen
    this.keys.forEach(key => {
      if (!localStorage.getItem(key)) {
        localStorage.setItem(key, JSON.stringify({}));
      }
    });
  }

  // Guardar en todas las claves para máxima compatibilidad
  setOrders(orders) {
    const ordersJson = JSON.stringify(orders);
    this.keys.forEach(key => {
      localStorage.setItem(key, ordersJson);
    });
    
    // También guardar con timestamp
    localStorage.setItem('oxxo_last_update', Date.now().toString());
    
    console.log('💾 Órdenes guardadas en almacenamiento compartido:', Object.keys(orders).length);
  }

  // Obtener desde cualquier clave disponible
  getOrders() {
    let orders = {};
    
    // Intentar obtener de cualquier clave
    for (const key of this.keys) {
      try {
        const stored = localStorage.getItem(key);
        if (stored) {
          const parsedOrders = JSON.parse(stored);
          // Combinar con órdenes existentes
          orders = { ...orders, ...parsedOrders };
        }
      } catch (error) {
        console.warn(`Error al leer ${key}:`, error);
      }
    }
    
    console.log('📖 Órdenes leídas del almacenamiento:', Object.keys(orders).length);
    return orders;
  }

  // Agregar una orden específica
  addOrder(orderId, orderData) {
    const currentOrders = this.getOrders();
    currentOrders[orderId] = orderData;
    this.setOrders(currentOrders);
    
    // Disparar evento personalizado para notificar cambios
    window.dispatchEvent(new CustomEvent('sharedOrdersChanged', {
      detail: { orderId, orderData, allOrders: currentOrders }
    }));
  }

  // Actualizar una orden existente
  updateOrder(orderId, orderData) {
    this.addOrder(orderId, orderData); // Mismo proceso
  }

  // Verificar si una orden existe
  hasOrder(orderId) {
    const orders = this.getOrders();
    return Boolean(orders[orderId]);
  }

  // Obtener una orden específica
  getOrder(orderId) {
    const orders = this.getOrders();
    return orders[orderId] || null;
  }

  // Limpiar todas las órdenes
  clearAll() {
    this.keys.forEach(key => {
      localStorage.removeItem(key);
    });
    localStorage.removeItem('oxxo_last_update');
    
    window.dispatchEvent(new CustomEvent('sharedOrdersCleared'));
  }

  // Forzar sincronización
  forceSync() {
    const orders = this.getOrders();
    this.setOrders(orders); // Re-guardar para forzar sync
    
    window.dispatchEvent(new CustomEvent('sharedOrdersSynced', {
      detail: { orders, timestamp: Date.now() }
    }));
  }
}

// Instancia global
export const sharedStorage = new SharedOrderStorage();