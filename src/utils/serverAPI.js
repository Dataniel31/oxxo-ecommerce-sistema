// API para manejar órdenes en archivo del servidor
class ServerOrderAPI {
  constructor() {
    // Detectar si estamos en red local o localhost
    const hostname = window.location.hostname;
    const port = window.location.port || (window.location.protocol === 'https:' ? '443' : '80');
    
    // Si es localhost, usar la IP de red para compatibilidad cross-device
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      // Usar la IP de red que Vite muestra (192.168.101.5)
      this.baseUrl = `${window.location.protocol}//192.168.101.5:${port}`;
    } else {
      this.baseUrl = window.location.origin;
    }
    
    this.ordersFile = '/orders.json';
    console.log('🌐 ServerAPI inicializada:', this.baseUrl);
    console.log('📱 Dispositivo:', hostname === 'localhost' ? 'Laptop/Desktop' : 'Dispositivo remoto');
  }

  // Obtener todas las órdenes del servidor
  async getAllOrders() {
    try {
      console.log('🔍 Consultando órdenes del servidor...');
      const response = await fetch(`${this.baseUrl}/api/orders`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        cache: 'no-cache' // Evitar caché para datos en tiempo real
      });
      
      if (response.ok) {
        const orders = await response.json();
        console.log('📋 Órdenes del servidor obtenidas:', Object.keys(orders).length);
        console.log('📋 IDs disponibles:', Object.keys(orders));
        return orders;
      } else {
        console.log('📋 Respuesta servidor no OK:', response.status, response.statusText);
        return {};
      }
    } catch (error) {
      console.warn('❌ Error leyendo órdenes del servidor:', error.message);
      // Fallback a localStorage si falla el servidor
      const localOrders = this.getLocalOrders();
      console.log('🔄 Usando localStorage como fallback:', Object.keys(localOrders).length);
      return localOrders;
    }
  }

  // Guardar orden en el servidor
  async saveOrder(orderId, orderData) {
    try {
      console.log(`💾 Guardando orden ${orderId} en servidor...`);
      
      const payload = {
        orderId,
        orderData: {
          ...orderData,
          id: orderId, // Asegurar que el ID esté en orderData
          timestamp: orderData.timestamp || Date.now(),
          deviceInfo: navigator.userAgent,
          syncTime: new Date().toISOString(),
          createdFrom: window.location.hostname
        }
      };
      
      console.log('📤 Payload a enviar:', payload);
      
      const response = await fetch(`${this.baseUrl}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const result = await response.json();
        console.log(`✅ Orden ${orderId} guardada exitosamente en servidor:`, result);
        
        // También guardar localmente como backup
        this.saveLocalOrder(orderId, orderData);
        
        return true;
      } else {
        const errorText = await response.text();
        console.error('❌ Error del servidor:', response.status, errorText);
        throw new Error(`Error ${response.status}: ${errorText}`);
      }
    } catch (error) {
      console.warn('❌ Error guardando en servidor, usando localStorage:', error.message);
      // Fallback a localStorage
      this.saveLocalOrder(orderId, orderData);
      return false;
    }
  }

  // Buscar una orden específica
  async getOrder(orderId) {
    try {
      console.log(`🔍 Buscando orden específica: ${orderId}`);
      const orders = await this.getAllOrders();
      const order = orders[orderId] || null;
      
      if (order) {
        console.log(`✅ Orden ${orderId} encontrada en servidor:`, order);
      } else {
        console.log(`❌ Orden ${orderId} NO encontrada en servidor`);
        console.log('📋 Órdenes disponibles:', Object.keys(orders));
      }
      
      return order;
    } catch (error) {
      console.warn('❌ Error buscando orden, usando localStorage:', error.message);
      const localOrder = this.getLocalOrder(orderId);
      console.log(`🔄 Resultado localStorage para ${orderId}:`, localOrder ? 'Encontrada' : 'No encontrada');
      return localOrder;
    }
  }

  // Fallback: Órdenes locales
  getLocalOrders() {
    const stored = localStorage.getItem('oxxo_orders_backup');
    return stored ? JSON.parse(stored) : {};
  }

  saveLocalOrder(orderId, orderData) {
    const orders = this.getLocalOrders();
    orders[orderId] = orderData;
    localStorage.setItem('oxxo_orders_backup', JSON.stringify(orders));
  }

  getLocalOrder(orderId) {
    const orders = this.getLocalOrders();
    return orders[orderId] || null;
  }

  // Limpiar todas las órdenes
  async clearAllOrders() {
    try {
      const response = await fetch(`${this.baseUrl}/api/orders`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        console.log('🗑️ Órdenes limpiadas del servidor');
      }
    } catch (error) {
      console.warn('Error limpiando servidor:', error);
    }
    
    // También limpiar local
    localStorage.removeItem('oxxo_orders_backup');
  }
}

export const serverAPI = new ServerOrderAPI();