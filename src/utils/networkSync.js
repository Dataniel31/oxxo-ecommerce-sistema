// Sistema de sincronización entre dispositivos usando localStorage con polling
class NetworkSync {
  constructor() {
    this.syncKey = 'oxxo_network_sync';
    this.ordersKey = 'oxxo_orders';
    this.lastSyncTime = 0;
    this.isPolling = false;
    
    // Inicializar sincronización
    this.initSync();
  }

  initSync() {
    // Crear estructura de sincronización si no existe
    if (!localStorage.getItem(this.syncKey)) {
      const syncData = {
        lastUpdate: Date.now(),
        deviceId: this.generateDeviceId(),
        orders: {}
      };
      localStorage.setItem(this.syncKey, JSON.stringify(syncData));
    }
    
    // Iniciar polling para sincronización
    this.startPolling();
  }

  generateDeviceId() {
    return 'device_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  startPolling() {
    if (this.isPolling) return;
    
    this.isPolling = true;
    setInterval(() => {
      this.checkForUpdates();
    }, 2000); // Verificar cada 2 segundos
  }

  checkForUpdates() {
    try {
      const syncData = this.getSyncData();
      const currentOrders = this.getLocalOrders();
      
      // Verificar si hay nuevas órdenes en el sync
      const syncOrders = syncData.orders || {};
      let hasChanges = false;
      
      for (const orderId in syncOrders) {
        if (!currentOrders[orderId] || 
            JSON.stringify(currentOrders[orderId]) !== JSON.stringify(syncOrders[orderId])) {
          currentOrders[orderId] = syncOrders[orderId];
          hasChanges = true;
          console.log(`🔄 Sincronizada orden desde red: ${orderId}`);
        }
      }
      
      // Actualizar localStorage local si hay cambios
      if (hasChanges) {
        localStorage.setItem(this.ordersKey, JSON.stringify(currentOrders));
        
        // Disparar evento personalizado
        window.dispatchEvent(new CustomEvent('ordersUpdated', {
          detail: { orders: currentOrders }
        }));
      }
      
    } catch (error) {
      console.error('Error en sincronización:', error);
    }
  }

  getSyncData() {
    const syncData = localStorage.getItem(this.syncKey);
    return syncData ? JSON.parse(syncData) : { orders: {} };
  }

  getLocalOrders() {
    const orders = localStorage.getItem(this.ordersKey);
    return orders ? JSON.parse(orders) : {};
  }

  // Sincronizar orden al crear/actualizar
  syncOrder(orderId, orderData) {
    try {
      const syncData = this.getSyncData();
      syncData.orders = syncData.orders || {};
      syncData.orders[orderId] = orderData;
      syncData.lastUpdate = Date.now();
      
      localStorage.setItem(this.syncKey, JSON.stringify(syncData));
      console.log(`📡 Orden sincronizada a red: ${orderId}`);
      
    } catch (error) {
      console.error('Error al sincronizar orden:', error);
    }
  }

  // Obtener todas las órdenes sincronizadas
  getAllSyncedOrders() {
    const syncData = this.getSyncData();
    const localOrders = this.getLocalOrders();
    
    // Combinar órdenes locales y sincronizadas
    const allOrders = { ...localOrders, ...(syncData.orders || {}) };
    
    // Actualizar localStorage local con todas las órdenes
    localStorage.setItem(this.ordersKey, JSON.stringify(allOrders));
    
    return allOrders;
  }
}

// Instancia global del sincronizador
export const networkSync = new NetworkSync();