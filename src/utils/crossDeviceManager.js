// Sistema simple y robusto para órdenes entre dispositivos
class CrossDeviceOrderManager {
  constructor() {
    // Usar una clave principal para todas las órdenes
    this.mainKey = 'OXXO_ALL_ORDERS';
    this.backupKeys = [
      'oxxo_orders_backup1',
      'oxxo_orders_backup2', 
      'oxxo_orders_backup3'
    ];
    this.initializeStorage();
  }

  initializeStorage() {
    // Inicializar todas las claves si no existen
    const keys = [this.mainKey, ...this.backupKeys];
    keys.forEach(key => {
      if (!localStorage.getItem(key)) {
        localStorage.setItem(key, JSON.stringify({}));
      }
    });
  }

  // Guardar orden con máxima redundancia
  saveOrder(orderId, orderData) {
    const orderToSave = {
      ...orderData,
      id: orderId,
      timestamp: Date.now(),
      deviceSaved: navigator.userAgent,
      syncTime: new Date().toISOString()
    };

    // Guardar en clave principal
    const mainOrders = this.getOrdersFromKey(this.mainKey);
    mainOrders[orderId] = orderToSave;
    localStorage.setItem(this.mainKey, JSON.stringify(mainOrders));

    // Guardar en todas las claves de respaldo
    this.backupKeys.forEach(key => {
      try {
        const backupOrders = this.getOrdersFromKey(key);
        backupOrders[orderId] = orderToSave;
        localStorage.setItem(key, JSON.stringify(backupOrders));
      } catch (error) {
        console.warn(`Error guardando en ${key}:`, error);
      }
    });

    // También guardar individualmente
    localStorage.setItem(`ORDER_${orderId}`, JSON.stringify(orderToSave));
    
    console.log(`💾 Orden ${orderId} guardada en ${this.backupKeys.length + 2} ubicaciones`);
    
    // Disparar evento global
    window.dispatchEvent(new CustomEvent('orderSaved', {
      detail: { orderId, orderData: orderToSave }
    }));

    return orderToSave;
  }

  // Buscar orden en todas las ubicaciones posibles
  findOrder(orderId) {
    console.log(`🔍 Buscando orden: ${orderId}`);
    
    // 1. Buscar en almacén individual
    try {
      const individual = localStorage.getItem(`ORDER_${orderId}`);
      if (individual) {
        const parsed = JSON.parse(individual);
        console.log(`✅ Orden encontrada individualmente: ${orderId}`);
        return parsed;
      }
    } catch (error) {
      console.warn('Error en búsqueda individual:', error);
    }

    // 2. Buscar en clave principal
    try {
      const mainOrders = this.getOrdersFromKey(this.mainKey);
      if (mainOrders[orderId]) {
        console.log(`✅ Orden encontrada en clave principal: ${orderId}`);
        return mainOrders[orderId];
      }
    } catch (error) {
      console.warn('Error en clave principal:', error);
    }

    // 3. Buscar en respaldos
    for (const key of this.backupKeys) {
      try {
        const orders = this.getOrdersFromKey(key);
        if (orders[orderId]) {
          console.log(`✅ Orden encontrada en ${key}: ${orderId}`);
          return orders[orderId];
        }
      } catch (error) {
        console.warn(`Error en ${key}:`, error);
      }
    }

    // 4. Buscar en localStorage legacy
    try {
      const legacy = localStorage.getItem('oxxo_orders');
      if (legacy) {
        const legacyOrders = JSON.parse(legacy);
        if (legacyOrders[orderId]) {
          console.log(`✅ Orden encontrada en legacy: ${orderId}`);
          return legacyOrders[orderId];
        }
      }
    } catch (error) {
      console.warn('Error en legacy:', error);
    }

    console.log(`❌ Orden NO encontrada: ${orderId}`);
    return null;
  }

  // Obtener órdenes desde una clave específica
  getOrdersFromKey(key) {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.warn(`Error leyendo ${key}:`, error);
      return {};
    }
  }

  // Obtener TODAS las órdenes de TODAS las fuentes
  getAllOrders() {
    const allOrders = {};
    
    // Combinar desde todas las fuentes
    const allKeys = [this.mainKey, ...this.backupKeys, 'oxxo_orders'];
    
    allKeys.forEach(key => {
      try {
        const orders = this.getOrdersFromKey(key);
        Object.assign(allOrders, orders);
      } catch (error) {
        console.warn(`Error combinando desde ${key}:`, error);
      }
    });

    // También buscar órdenes individuales
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('ORDER_')) {
        try {
          const orderData = JSON.parse(localStorage.getItem(key));
          allOrders[orderData.id] = orderData;
        } catch (error) {
          console.warn(`Error leyendo orden individual ${key}:`, error);
        }
      }
    }

    console.log(`📋 Total órdenes encontradas: ${Object.keys(allOrders).length}`);
    return allOrders;
  }

  // Limpiar TODAS las órdenes
  clearAll() {
    const allKeys = [this.mainKey, ...this.backupKeys, 'oxxo_orders'];
    allKeys.forEach(key => {
      localStorage.removeItem(key);
    });

    // Limpiar órdenes individuales
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key && key.startsWith('ORDER_')) {
        localStorage.removeItem(key);
      }
    }

    console.log('🗑️ Todas las órdenes han sido limpiadas');
  }

  // Debug: mostrar estado completo
  debugStorage() {
    console.log('🔍 DEBUG - Estado completo del almacenamiento:');
    console.log('Clave principal:', this.getOrdersFromKey(this.mainKey));
    this.backupKeys.forEach(key => {
      console.log(`${key}:`, this.getOrdersFromKey(key));
    });
    console.log('Legacy:', this.getOrdersFromKey('oxxo_orders'));
    console.log('Total combinado:', this.getAllOrders());
  }
}

// Instancia global
export const crossDeviceManager = new CrossDeviceOrderManager();