import React, { useRef, useEffect, useState } from 'react';
import jsQR from 'jsqr';
import { Camera, CameraOff, Scan, X, RefreshCw } from 'lucide-react';
import './AlternativeScanner.css';

const AlternativeScanner = ({ onScanSuccess, onClose, isVisible }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState(null);
  const [stream, setStream] = useState(null);
  const [scanResult, setScanResult] = useState(null);
  const [availableCameras, setAvailableCameras] = useState([]);
  const [selectedCamera, setSelectedCamera] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const animationFrameRef = useRef(null);

  useEffect(() => {
    if (isVisible) {
      initializeCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isVisible]);

  const initializeCamera = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Primer paso: Forzar directamente cámara trasera
      console.log('🔑 Solicitando SOLO cámara trasera...');
      const tempStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: { exact: 'environment' } } 
      });
      tempStream.getTracks().forEach(track => track.stop());
      
      // Segundo paso: Filtrar SOLO cámaras traseras
      await new Promise(resolve => setTimeout(resolve, 100));
      const devices = await navigator.mediaDevices.enumerateDevices();
      const allCameras = devices.filter(device => device.kind === 'videoinput');
      
      // FILTRAR: Solo cámaras traseras/principales
      const backCameras = allCameras.filter(camera => {
        const label = camera.label.toLowerCase();
        return label.includes('back') || 
               label.includes('rear') ||
               label.includes('environment') ||
               label.includes('wide') ||
               label.includes('main') ||
               label.includes('0') ||
               (!label.includes('front') && !label.includes('user') && !label.includes('selfie'));
      });
      
      console.log('📷 Solo cámaras traseras encontradas:', backCameras);
      setAvailableCameras(backCameras); // Solo mostrar traseras
      
      if (backCameras.length === 0) {
        setError('No se encontró cámara trasera en este dispositivo');
        setIsLoading(false);
        return;
      }
      
      // Seleccionar la mejor cámara trasera (primera disponible)
      const selectedBackCamera = backCameras[0];
      console.log('🎯 Cámara trasera seleccionada:', selectedBackCamera.label);
      setSelectedCamera(selectedBackCamera.deviceId);
      
      // Iniciar SOLO con cámara trasera
      await startCameraWithDevice(selectedBackCamera.deviceId);
      
    } catch (err) {
      console.error('Error inicializando cámaras:', err);
      setError(`Error de inicialización: ${err.message}`);
      setIsLoading(false);
    }
  };

  const startCameraWithDevice = async (deviceId) => {
    try {
      setError(null);
      setIsLoading(true);
      
      // Detener cámara anterior si existe
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
      }

      // Configuración SOLO para cámaras traseras - máxima calidad
      const constraints = {
        video: {
          deviceId: deviceId ? { exact: deviceId } : undefined,
          width: { ideal: 1280, max: 1920 },
          height: { ideal: 720, max: 1080 },
          frameRate: { ideal: 30, max: 60 },
          focusMode: 'continuous',
          facingMode: 'environment' // SIEMPRE cámara trasera
        }
      };

      console.log('🎥 Iniciando cámara con constraints:', constraints);
      
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        
        // Manejar eventos del video
        videoRef.current.onloadedmetadata = () => {
          console.log('📹 Video metadata cargado');
          videoRef.current.play().then(() => {
            console.log('▶️ Video reproduciendo');
            setIsLoading(false);
            setIsScanning(true);
            
            // Verificar si la imagen es clara después de 2 segundos
            setTimeout(() => {
              if (videoRef.current && videoRef.current.videoWidth > 0) {
                console.log('✅ Cámara inicializada correctamente');
                startScanning();
              } else {
                console.log('⚠️ Reiniciando cámara por imagen borrosa...');
                handleRetry();
              }
            }, 2000);
            
          }).catch(err => {
            console.error('Error reproduciendo video:', err);
            setError('Error reproduciendo video de la cámara');
            setIsLoading(false);
          });
        };
        
        videoRef.current.onerror = (err) => {
          console.error('Error en video element:', err);
          setError('Error en el elemento de video');
          setIsLoading(false);
        };
      }

    } catch (err) {
      console.error('Error accediendo a la cámara:', err);
      setError(`Error de cámara: ${err.message}`);
      setIsLoading(false);
      setIsScanning(false);
    }
  };

  const switchCamera = async (deviceId) => {
    console.log('🔄 Cambiando a cámara:', deviceId);
    setIsLoading(true);
    setIsScanning(false);
    
    // Parar cámara actual completamente
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    
    // Pequeña pausa para limpiar recursos
    await new Promise(resolve => setTimeout(resolve, 300));
    
    setSelectedCamera(deviceId);
    await startCameraWithDevice(deviceId);
  };

  const startScanning = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    if (!video || !canvas) {
      console.warn('⚠️ Video o canvas no disponible');
      return;
    }

    const ctx = canvas.getContext('2d');
    let lastScanTime = 0;
    const scanInterval = 80; // Escanear cada 80ms - balance entre velocidad y estabilidad
    
    const scan = (timestamp) => {
      try {
        if (!isScanning || !video || !canvas) {
          return;
        }

        // Throttling para mejor rendimiento
        if (timestamp - lastScanTime < scanInterval) {
          animationFrameRef.current = requestAnimationFrame(scan);
          return;
        }
        lastScanTime = timestamp;

        if (video.readyState === video.HAVE_ENOUGH_DATA && video.videoWidth > 0 && video.videoHeight > 0) {
          // Ajustar canvas al tamaño del video
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          
          // Dibujar frame actual
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          
          // Obtener datos de imagen
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          
          // Escanear QR con configuraciones balanceadas
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: "attemptBoth"
          });
          
          if (code && code.data) {
            console.log('🎯 QR Code detectado:', code.data);
            setScanResult(code.data);
            
            // Destacar el código detectado
            if (code.location) {
              ctx.strokeStyle = '#00ff00';
              ctx.lineWidth = 4;
              ctx.beginPath();
              ctx.moveTo(code.location.topLeftCorner.x, code.location.topLeftCorner.y);
              ctx.lineTo(code.location.topRightCorner.x, code.location.topRightCorner.y);
              ctx.lineTo(code.location.bottomRightCorner.x, code.location.bottomRightCorner.y);
              ctx.lineTo(code.location.bottomLeftCorner.x, code.location.bottomLeftCorner.y);
              ctx.closePath();
              ctx.stroke();
            }
            
            // Procesar con un pequeño delay para estabilidad
            setTimeout(() => {
              stopCamera();
              onScanSuccess(code.data);
            }, 500);
            
            return; // Parar el escaneo
          }
        }
        
        // Continuar escaneando
        if (isScanning) {
          animationFrameRef.current = requestAnimationFrame(scan);
        }
        
      } catch (err) {
        console.error('Error durante el escaneo:', err);
        // Continuar escaneando a pesar del error
        if (isScanning) {
          animationFrameRef.current = requestAnimationFrame(scan);
        }
      }
    };
    
    animationFrameRef.current = requestAnimationFrame(scan);
  };

  const drawLine = (ctx, begin, end, color) => {
    ctx.beginPath();
    ctx.moveTo(begin.x, begin.y);
    ctx.lineTo(end.x, end.y);
    ctx.lineWidth = 4;
    ctx.strokeStyle = color;
    ctx.stroke();
  };

  const stopCamera = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    
    setIsScanning(false);
    setScanResult(null);
  };

  const handleClose = () => {
    stopCamera();
    onClose();
  };

  const handleRetry = () => {
    stopCamera();
    setTimeout(() => {
      if (selectedCamera) {
        startCameraWithDevice(selectedCamera);
      } else {
        initializeCamera();
      }
    }, 500);
  };

  if (!isVisible) return null;

  return (
    <div className="alternative-scanner-overlay">
      <div className="alternative-scanner-modal">
        <div className="scanner-header">
          <h3>
            <Scan size={24} />
            Escáner Cámara Trasera
          </h3>
          <button className="close-btn" onClick={handleClose}>
            <X size={24} />
          </button>
        </div>

        <div className="scanner-content">
          {error && (
            <div className="scanner-error">
              <CameraOff size={32} />
              <p>{error}</p>
              <div className="error-actions">
                <button className="retry-btn" onClick={handleRetry}>
                  <RefreshCw size={20} />
                  Reintentar
                </button>
                <button className="manual-btn" onClick={handleClose}>
                  Input Manual
                </button>
              </div>
            </div>
          )}

          {!error && (
            <div className="camera-container">
              {/* Controles de cámara */}
              {availableCameras.length > 0 && (
                <div className="camera-controls">
                  <div className="camera-info">
                    <span className="camera-count">
                      � {availableCameras.length} cámara{availableCameras.length > 1 ? 's' : ''} trasera{availableCameras.length > 1 ? 's' : ''} disponible{availableCameras.length > 1 ? 's' : ''}
                    </span>
                  </div>
                  
                  {availableCameras.length > 1 && (
                    <div className="camera-selector">
                      <select 
                        value={selectedCamera || ''} 
                        onChange={(e) => switchCamera(e.target.value)}
                        disabled={isLoading}
                      >
                        {availableCameras.map((camera, index) => {
                          let label = camera.label || `Cámara Trasera ${index + 1}`;
                          
                          // Solo nombres para cámaras traseras
                          if (label.toLowerCase().includes('back') || label.toLowerCase().includes('rear')) {
                            label = `📱 Cámara Trasera Principal`;
                          } else if (label.toLowerCase().includes('wide')) {
                            label = `📱 Cámara Trasera Gran Angular`;
                          } else if (label.toLowerCase().includes('ultra')) {
                            label = `📱 Cámara Trasera Ultra Wide`;
                          } else if (label.toLowerCase().includes('environment')) {
                            label = `🌍 Cámara Trasera Externa`;
                          } else {
                            label = `📱 Cámara Trasera ${index + 1}`;
                          }
                          
                          return (
                            <option key={camera.deviceId} value={camera.deviceId}>
                              {label}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                  )}
                </div>
              )}

              <div className="camera-preview">
                {isLoading && (
                  <div className="camera-loading">
                    <RefreshCw size={48} className="loading-spinner" />
                    <p>Iniciando cámara...</p>
                  </div>
                )}
                
                <video
                  ref={videoRef}
                  className={`camera-video ${isLoading ? 'loading' : ''}`}
                  playsInline
                  muted
                />
                <canvas
                  ref={canvasRef}
                  className="scanner-overlay"
                />
                
                {/* Marco de escaneo */}
                {!isLoading && (
                  <div className="scan-frame">
                    <div className="scan-corners">
                      <div className="corner top-left"></div>
                      <div className="corner top-right"></div>
                      <div className="corner bottom-left"></div>
                      <div className="corner bottom-right"></div>
                    </div>
                  </div>
                )}

                {scanResult && (
                  <div className="scan-success">
                    <div className="success-message">
                      ✅ Código detectado: {scanResult}
                    </div>
                  </div>
                )}
              </div>

              <div className="scanner-instructions">
                <p>📱 Escáner Trasero Optimizado</p>
                <div className="scanner-tips">
                  <span>• 🎯 Solo cámara trasera - Mayor precisión</span>
                  <span>• 💡 Enfoque continuo activado</span>
                  <span>• 📐 Mantén el código dentro del marco</span>
                  <span>• ⚡ Resolución HD para mejor detección</span>
                </div>
              </div>

              <div className="scanner-actions">
                <button 
                  className="retry-btn" 
                  onClick={handleRetry}
                  disabled={isLoading}
                >
                  <RefreshCw size={20} />
                  {isLoading ? 'Cargando...' : 'Reiniciar Cámara'}
                </button>
                <button className="manual-btn" onClick={handleClose}>
                  Ingresar Manualmente
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AlternativeScanner;