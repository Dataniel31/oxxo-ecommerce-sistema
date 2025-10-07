import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl'
import fs from 'fs'
import path from 'path'

  // Plugin personalizado para API de órdenes
const ordersApiPlugin = () => {
  const ordersFile = path.join(process.cwd(), 'orders.json')
  
  // Inicializar archivo si no existe
  if (!fs.existsSync(ordersFile)) {
    fs.writeFileSync(ordersFile, JSON.stringify({}))
    console.log('📄 Archivo orders.json creado')
  }
  
  console.log('🔄 API de órdenes iniciada en /api/orders')
  
  return {
    name: 'orders-api',
    configureServer(server) {
      // GET /api/orders - Obtener todas las órdenes
      server.middlewares.use('/api/orders', (req, res, next) => {
        if (req.method === 'GET') {
          try {
            const orders = JSON.parse(fs.readFileSync(ordersFile, 'utf8'))
            res.setHeader('Content-Type', 'application/json')
            res.setHeader('Access-Control-Allow-Origin', '*')
            res.end(JSON.stringify(orders))
          } catch (error) {
            console.error('Error leyendo órdenes:', error)
            res.statusCode = 500
            res.end(JSON.stringify({ error: 'Error interno del servidor' }))
          }
          return
        }
        
        // POST /api/orders - Guardar orden
        if (req.method === 'POST') {
          let body = ''
          req.on('data', chunk => {
            body += chunk.toString()
          })
          
          req.on('end', () => {
            try {
              const { orderId, orderData } = JSON.parse(body)
              
              // Leer órdenes existentes
              const orders = JSON.parse(fs.readFileSync(ordersFile, 'utf8'))
              
              // Agregar nueva orden
              orders[orderId] = orderData
              
              // Guardar de vuelta
              fs.writeFileSync(ordersFile, JSON.stringify(orders, null, 2))
              
              console.log(`✅ Orden ${orderId} guardada en archivo`)
              
              res.setHeader('Content-Type', 'application/json')
              res.setHeader('Access-Control-Allow-Origin', '*')
              res.statusCode = 200
              res.end(JSON.stringify({ success: true, orderId }))
            } catch (error) {
              console.error('Error guardando orden:', error)
              res.statusCode = 400
              res.end(JSON.stringify({ error: 'Datos inválidos' }))
            }
          })
          return
        }
        
        // DELETE /api/orders - Limpiar todas las órdenes
        if (req.method === 'DELETE') {
          try {
            fs.writeFileSync(ordersFile, JSON.stringify({}))
            console.log('🗑️ Todas las órdenes limpiadas')
            
            res.setHeader('Content-Type', 'application/json')
            res.setHeader('Access-Control-Allow-Origin', '*')
            res.statusCode = 200
            res.end(JSON.stringify({ success: true, message: 'Órdenes limpiadas' }))
          } catch (error) {
            console.error('Error limpiando órdenes:', error)
            res.statusCode = 500
            res.end(JSON.stringify({ error: 'Error interno del servidor' }))
          }
          return
        }
        
        // OPTIONS para CORS
        if (req.method === 'OPTIONS') {
          res.setHeader('Access-Control-Allow-Origin', '*')
          res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE')
          res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
          res.statusCode = 200
          res.end()
          return
        }
        
        next()
      })
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), basicSsl(), ordersApiPlugin()],
  server: {
    https: true,     // Habilitar HTTPS
    host: '0.0.0.0', // Permite conexiones desde cualquier IP de la red local
    port: 5175,      // Puerto fijo para facilidad de uso
    strictPort: true // Falla si el puerto está ocupado en lugar de cambiar
  },
  preview: {
    https: true,     // También para el modo preview
    host: '0.0.0.0', // También para el modo preview
    port: 4173,
    strictPort: true
  }
})
