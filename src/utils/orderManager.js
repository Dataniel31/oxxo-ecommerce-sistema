import { serverAPI } from './serverAPI.js';

// Sistema simple de ordenes sin contexto React
class OrderManager {
  constructor() {
    this.storageKey = 'oxxo_orders';
    this.sessionKey = 'oxxo_session';
    this.listeners = [];
    this.setupStorageListener();
    this.setupServerSync();
    this.initializePersistence();
  }

  // Inicializar persistencia mejorada
  async initializePersistence() {
    try {
      // Verificar si es una nueva sesión de navegador
      const sessionId = sessionStorage.getItem(this.sessionKey);
      const isNewSession = !sessionId;
      
      if (isNewSession) {
        // Solo limpiar en nueva sesión de navegador, no en npm run dev
        console.log('🆕 Nueva sesión de navegador - Preparando sistema...');
        sessionStorage.setItem(this.sessionKey, Date.now().toString());
        
        // Crear órdenes de ejemplo para testing inmediato
        await this.createTestOrders();
        
        console.log('✅ Sistema preparado para nueva sesión');
      } else {
        console.log('🔄 Sesión existente - Sincronizando...');
        // Restaurar órdenes existentes
        await this.syncWithServer();
      }
    } catch (error) {
      console.warn('Error inicializando persistencia:', error);
    }
  }

  // Crear órdenes de ejemplo para testing
  async createTestOrders() {
    const testOrders = [
      {
        id: 'OXXO12345678',
        customerName: 'Juan Pérez',
        total: 11.90,
        items: [
          { id: 1, name: 'Coca-Cola 600ml', price: 3.50, quantity: 2 },
          { id: 2, name: 'Doritos Nacho', price: 4.90, quantity: 1 }
        ],
        paymentMethod: 'tarjeta',
        status: 'confirmed'
      },
      {
        id: 'OXXO87654321',
        customerName: 'Ana Martínez',
        total: 11.10,
        items: [
          { id: 4, name: 'Inka Kola 500ml', price: 3.20, quantity: 2 },
          { id: 5, name: 'Pringles Original', price: 4.70, quantity: 1 }
        ],
        paymentMethod: 'yape',
        status: 'confirmed'
      }
    ];

    for (const testOrder of testOrders) {
      const fullOrder = {
        ...testOrder,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        timestamp: Date.now(),
        statusHistory: [{
          status: 'confirmed',
          timestamp: new Date().toISOString(),
          description: 'Orden de prueba creada'
        }]
      };

      try {
        await serverAPI.saveOrder(testOrder.id, fullOrder);
        console.log(`✅ Orden de prueba creada: ${testOrder.id}`);
      } catch (error) {
        console.warn(`Error creando orden de prueba ${testOrder.id}:`, error);
      }
    }
  }

  // Configurar sincronizacion con servidor
  setupServerSync() {
    // Auto-sync con servidor cada 5 segundos
    setInterval(async () => {
      try {
        await this.syncWithServer();
      } catch (error) {
        console.warn('Error en auto-sync:', error);
      }
    }, 5000);
  }

  // Sincronizar con el servidor
  async syncWithServer() {
    try {
      console.log('🔄 Sincronizando con servidor...');
      const serverOrders = await serverAPI.getAllOrders();
      
      // Actualizar localStorage con datos del servidor
      if (Object.keys(serverOrders).length > 0) {
        localStorage.setItem(this.storageKey, JSON.stringify(serverOrders));
        console.log('📥 Órdenes sincronizadas desde servidor a localStorage');
      }
      
      // Notificar listeners si hay cambios
      this.notifyListeners();
      return serverOrders;
    } catch (error) {
      console.warn('❌ Error sincronizando con servidor:', error.message);
      return {};
    }
  }

  // Configurar listener para cambios en storage
  setupStorageListener() {
    window.addEventListener('storage', (e) => {
      if (e.key === this.storageKey) {
        console.log('Detectado cambio en ordenes desde otro dispositivo');
        this.notifyListeners();
      }
    });
  }

  // Agregar listener para cambios
  addListener(callback) {
    this.listeners.push(callback);
  }

  // Remover listener
  removeListener(callback) {
    this.listeners = this.listeners.filter(l => l !== callback);
  }

  // Notificar a todos los listeners
  notifyListeners() {
    // Notificar a listeners registrados
    this.listeners.forEach(callback => {
      try {
        callback();
      } catch (error) {
        console.error('Error en listener:', error);
      }
    });

    // Disparar evento global para componentes React
    window.dispatchEvent(new CustomEvent('ordersUpdated', {
      detail: { timestamp: Date.now() }
    }));
    
    console.log('Notificacion de actualizacion enviada');
  }

  // Obtener todas las ordenes
  async getAllOrders() {
    try {
      // Intentar obtener del servidor primero
      const serverOrders = await serverAPI.getAllOrders();
      return serverOrders;
    } catch (error) {
      console.warn('Error obteniendo del servidor, usando localStorage:', error);
      // Fallback a localStorage
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : {};
    }
  }

  // Crear una nueva orden
  async createOrder(orderData) {
    console.log('🆕 Creando nueva orden...');
    const orders = await this.getAllOrders();
    
    // Generar ID si no existe
    const orderId = orderData.id || this.generateOrderId();
    console.log(`🔑 ID de orden generado: ${orderId}`);
    
    const newOrder = {
      ...orderData,
      id: orderId,
      status: 'confirmed',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      customerName: orderData.customerName || this.generateCustomerName(),
      timestamp: Date.now(), // Asegurar timestamp para compatibilidad
      statusHistory: [{
        status: 'confirmed',
        timestamp: new Date().toISOString(),
        description: 'Pago confirmado exitosamente'
      }]
    };

    console.log('📦 Orden preparada para guardar:', newOrder);

    // Guardar en servidor PRIMERO
    try {
      const serverSaved = await serverAPI.saveOrder(orderId, newOrder);
      if (serverSaved) {
        console.log(`✅ Orden ${orderId} guardada exitosamente en servidor`);
      } else {
        console.log(`⚠️ Orden ${orderId} guardada solo localmente`);
      }
    } catch (error) {
      console.warn('❌ Error guardando en servidor:', error.message);
    }
    
    // También mantener en localStorage como backup
    orders[orderId] = newOrder;
    localStorage.setItem(this.storageKey, JSON.stringify(orders));
    console.log(`💾 Orden ${orderId} guardada también en localStorage`);
    
    this.notifyListeners();
    return newOrder;
  }

  // Generar ID de orden unico
  generateOrderId() {
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `OXXO${timestamp}${random}`;
  }

  // Obtener una orden por ID
  async getOrder(orderId) {
    try {
      console.log(`🔍 Buscando orden: ${orderId}`);
      
      // Primero intentar sincronización forzada
      await this.syncWithServer();
      
      // Buscar en servidor
      const order = await serverAPI.getOrder(orderId);
      console.log(`📡 Busqueda servidor - ${orderId}:`, order ? 'Encontrada' : 'No encontrada');
      
      if (order) {
        return order;
      }
      
      // Si no se encuentra en servidor, buscar en localStorage
      console.log(`🔄 Buscando en localStorage como fallback...`);
      const orders = JSON.parse(localStorage.getItem(this.storageKey) || '{}');
      const localOrder = orders[orderId] || null;
      console.log(`💾 Busqueda localStorage - ${orderId}:`, localOrder ? 'Encontrada' : 'No encontrada');
      
      return localOrder;
    } catch (error) {
      console.warn('❌ Error buscando en servidor, usando localStorage:', error.message);
      // Fallback a localStorage
      const orders = JSON.parse(localStorage.getItem(this.storageKey) || '{}');
      const localOrder = orders[orderId] || null;
      console.log(`💾 Fallback localStorage - ${orderId}:`, localOrder ? 'Encontrada' : 'No encontrada');
      return localOrder;
    }
  }

  // Actualizar estado de orden
  async updateOrderStatus(orderId, newStatus, description = '') {
    const orders = await this.getAllOrders();
    const order = orders[orderId];
    
    if (!order) {
      console.error(`Orden ${orderId} no encontrada`);
      return false;
    }

    order.status = newStatus;
    order.updatedAt = new Date().toISOString();
    order.statusHistory.push({
      status: newStatus,
      timestamp: new Date().toISOString(),
      description
    });

    // Actualizar en servidor
    try {
      await serverAPI.saveOrder(orderId, order);
      console.log(`Orden actualizada en servidor: ${orderId}`);
    } catch (error) {
      console.warn('Error actualizando en servidor:', error);
    }
    
    // Mantener en localStorage
    orders[orderId] = order;
    localStorage.setItem(this.storageKey, JSON.stringify(orders));
    
    this.notifyListeners();
    return true;
  }

  // Generar nombre de cliente aleatorio para demo
  generateCustomerName() {
    const nombres = ['Juan', 'Maria', 'Carlos', 'Ana', 'Luis', 'Carmen', 'Pedro', 'Rosa'];
    const apellidos = ['Perez', 'Gonzalez', 'Rodriguez', 'Lopez', 'Martinez', 'Garcia', 'Sanchez', 'Torres'];
    
    const nombre = nombres[Math.floor(Math.random() * nombres.length)];
    const apellido1 = apellidos[Math.floor(Math.random() * apellidos.length)];
    const apellido2 = apellidos[Math.floor(Math.random() * apellidos.length)];
    
    return `${nombre} ${apellido1} ${apellido2}`;
  }

  // Verificar si una orden existe
  async orderExists(orderId) {
    const order = await this.getOrder(orderId);
    return Boolean(order);
  }
}

// Estados de ordenes
export const ORDER_STATUSES = {
  CONFIRMED: 'confirmed',
  PREPARING: 'preparing', 
  READY: 'ready',
  DELIVERED: 'delivered'
};

export const STATUS_DESCRIPTIONS = {
  [ORDER_STATUSES.CONFIRMED]: 'Pagado - Listo para preparar',
  [ORDER_STATUSES.PREPARING]: 'En preparación',
  [ORDER_STATUSES.READY]: 'Listo para recoger', 
  [ORDER_STATUSES.DELIVERED]: 'Entregado'
};

// Instancia global del manager
export const orderManager = new OrderManager();