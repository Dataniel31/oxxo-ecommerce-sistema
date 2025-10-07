import React, { useState, useEffect } from 'react';
import { orderManager } from '../utils/orderManager';
import { serverAPI } from '../utils/serverAPI';

const TestSync = () => {
  const [orders, setOrders] = useState({});
  const [testOrderId, setTestOrderId] = useState('');
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const addLog = (message) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
    console.log(`[TestSync] ${message}`);
  };

  const loadOrders = async () => {
    setIsLoading(true);
    addLog('🔍 Cargando órdenes...');
    try {
      const allOrders = await orderManager.getAllOrders();
      setOrders(allOrders);
      addLog(`📋 ${Object.keys(allOrders).length} órdenes encontradas`);
      if (Object.keys(allOrders).length > 0) {
        addLog(`🔑 IDs disponibles: ${Object.keys(allOrders).join(', ')}`);
      }
    } catch (error) {
      addLog(`❌ Error cargando órdenes: ${error.message}`);
    }
    setIsLoading(false);
  };

  const createTestOrder = async () => {
    setIsLoading(true);
    addLog('🆕 Creando orden de prueba...');
    try {
      const testOrder = {
        customerName: 'Cliente de Prueba',
        total: 25.50,
        items: [
          { id: 1, name: 'Coca-Cola 600ml', price: 3.50, quantity: 2 },
          { id: 2, name: 'Doritos Nacho', price: 4.90, quantity: 1 }
        ],
        paymentMethod: 'test',
        phone: '999123456',
        email: 'test@test.com'
      };

      const newOrder = await orderManager.createOrder(testOrder);
      setTestOrderId(newOrder.id);
      addLog(`✅ Orden creada exitosamente: ${newOrder.id}`);
      loadOrders(); // Recargar lista
    } catch (error) {
      addLog(`❌ Error creando orden: ${error.message}`);
    }
    setIsLoading(false);
  };

  const searchOrder = async () => {
    if (!testOrderId.trim()) {
      addLog('⚠️ Ingresa un ID de orden para buscar');
      return;
    }

    setIsLoading(true);
    addLog(`🔍 Buscando orden: ${testOrderId}`);
    try {
      const order = await orderManager.getOrder(testOrderId.toUpperCase());
      if (order) {
        addLog(`✅ Orden encontrada: ${order.customerName} - S/${order.total}`);
      } else {
        addLog(`❌ Orden NO encontrada: ${testOrderId}`);
      }
    } catch (error) {
      addLog(`❌ Error buscando orden: ${error.message}`);
    }
    setIsLoading(false);
  };

  const testServerAPI = async () => {
    setIsLoading(true);
    addLog('🌐 Probando conexión directa al servidor...');
    try {
      const serverOrders = await serverAPI.getAllOrders();
      addLog(`📡 Servidor responde: ${Object.keys(serverOrders).length} órdenes`);
      if (Object.keys(serverOrders).length > 0) {
        addLog(`🗂️ IDs del servidor: ${Object.keys(serverOrders).join(', ')}`);
      }
    } catch (error) {
      addLog(`❌ Error del servidor: ${error.message}`);
    }
    setIsLoading(false);
  };

  const clearAllOrders = async () => {
    if (!window.confirm('¿Seguro que quieres limpiar todas las órdenes?')) return;
    
    setIsLoading(true);
    addLog('🗑️ Limpiando todas las órdenes...');
    try {
      await serverAPI.clearAllOrders();
      localStorage.removeItem('oxxo_orders');
      setOrders({});
      setTestOrderId('');
      addLog('✅ Todas las órdenes limpiadas');
    } catch (error) {
      addLog(`❌ Error limpiando órdenes: ${error.message}`);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadOrders();
  }, []);

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>🧪 Prueba de Sincronización de Órdenes</h1>
      <p>Usa esta página para probar la sincronización entre dispositivos.</p>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <button onClick={loadOrders} disabled={isLoading}>
          📋 Cargar Órdenes
        </button>
        <button onClick={createTestOrder} disabled={isLoading}>
          🆕 Crear Orden de Prueba
        </button>
        <button onClick={testServerAPI} disabled={isLoading}>
          🌐 Test Server API
        </button>
        <button onClick={clearAllOrders} disabled={isLoading} style={{backgroundColor: '#dc3545', color: 'white'}}>
          🗑️ Limpiar Todo
        </button>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>🔍 Buscar Orden</h3>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Ingresa ID de orden (ej: OXXO12345678)"
            value={testOrderId}
            onChange={(e) => setTestOrderId(e.target.value)}
            style={{ padding: '8px', flex: 1, maxWidth: '300px' }}
          />
          <button onClick={searchOrder} disabled={isLoading}>
            🔍 Buscar
          </button>
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>📋 Órdenes Actuales ({Object.keys(orders).length})</h3>
        {Object.keys(orders).length === 0 ? (
          <p>No hay órdenes disponibles</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {Object.entries(orders).map(([id, order]) => (
              <li key={id} style={{ 
                backgroundColor: '#f8f9fa', 
                padding: '10px', 
                margin: '5px 0', 
                borderRadius: '8px',
                border: '1px solid #dee2e6'
              }}>
                <strong>{id}</strong> - {order.customerName} - S/{order.total}
                <br />
                <small>Estado: {order.status} | Creado: {new Date(order.createdAt).toLocaleString()}</small>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <h3>📝 Logs de Actividad</h3>
        <div style={{ 
          backgroundColor: '#f8f9fa', 
          padding: '10px', 
          height: '200px', 
          overflowY: 'auto',
          fontFamily: 'monospace',
          fontSize: '12px',
          border: '1px solid #dee2e6',
          borderRadius: '8px'
        }}>
          {logs.map((log, index) => (
            <div key={index}>{log}</div>
          ))}
          {logs.length === 0 && (
            <div style={{ color: '#6c757d' }}>Los logs aparecerán aquí...</div>
          )}
        </div>
      </div>

      <div style={{ marginTop: '20px', fontSize: '12px', color: '#6c757d' }}>
        <p><strong>Instrucciones:</strong></p>
        <ol>
          <li>Crea una orden de prueba desde aquí (laptop)</li>
          <li>Copia el ID de orden generado</li>
          <li>Ve al módulo de cajero desde tu celular</li>
          <li>Busca la orden usando el ID</li>
          <li>Verifica que aparezca correctamente</li>
        </ol>
      </div>
    </div>
  );
};

export default TestSync;