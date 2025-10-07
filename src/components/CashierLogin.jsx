import React, { useState } from 'react';
import { Lock, User, Eye, EyeOff, AlertCircle } from 'lucide-react';
import './CashierLogin.css';

const CashierLogin = ({ onLogin }) => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Credenciales de prueba
  const validCredentials = [
    { username: 'cajero1', password: 'oxxo123', name: 'María González', shift: 'Mañana' },
    { username: 'cajero2', password: 'oxxo456', name: 'Carlos Ruiz', shift: 'Tarde' },
    { username: 'supervisor', password: 'admin789', name: 'Ana Supervisor', shift: 'Todo el día' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Simular verificación de credenciales
    setTimeout(() => {
      const user = validCredentials.find(
        cred => cred.username === credentials.username && cred.password === credentials.password
      );

      if (user) {
        onLogin(user);
      } else {
        setError('Usuario o contraseña incorrectos');
      }
      setIsLoading(false);
    }, 1000);
  };

  const fillTestCredentials = (userType) => {
    const testUser = validCredentials.find(cred => cred.username === userType);
    setCredentials({
      username: testUser.username,
      password: testUser.password
    });
    setError('');
  };

  return (
    <div className="cashier-login">
      <div className="login-container">
        <div className="login-header">
          <div className="oxxo-logo">
            <img 
              src="https://oxxo.pe/img/logo-r.png" 
              alt="OXXO - Todo Día" 
              className="logo-image"
            />
          </div>
          <h2>Sistema de Cajero</h2>
          <p>Ingrese sus credenciales para acceder</p>
        </div>

        <form onSubmit={handleLogin} className="login-form">
          <div className="form-group">
            <label htmlFor="username">Usuario</label>
            <div className="input-container">
              <User className="input-icon" size={18} />
              <input
                type="text"
                id="username"
                name="username"
                value={credentials.username}
                onChange={handleInputChange}
                placeholder="Ingrese su usuario"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <div className="input-container">
              <Lock className="input-icon" size={18} />
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={credentials.password}
                onChange={handleInputChange}
                placeholder="Ingrese su contraseña"
                required
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="error-message">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <button type="submit" className="login-btn" disabled={isLoading}>
            {isLoading ? (
              <>
                <div className="spinner"></div>
                Verificando...
              </>
            ) : (
              'Iniciar Sesión'
            )}
          </button>
        </form>

        <div className="test-credentials">
          <h3>Credenciales de Prueba:</h3>
          <div className="test-buttons">
            <button 
              type="button" 
              className="test-btn"
              onClick={() => fillTestCredentials('cajero1')}
            >
              Cajero Mañana
            </button>
            <button 
              type="button" 
              className="test-btn"
              onClick={() => fillTestCredentials('cajero2')}
            >
              Cajero Tarde
            </button>
            <button 
              type="button" 
              className="test-btn supervisor"
              onClick={() => fillTestCredentials('supervisor')}
            >
              Supervisor
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CashierLogin;