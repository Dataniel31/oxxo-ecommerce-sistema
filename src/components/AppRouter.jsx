import React, { useState } from 'react';
import { ShoppingBag, Users } from 'lucide-react';
import App from '../App';
import CashierModule from './CashierModule';
import './AppRouter.css';

const AppRouter = () => {
  const [currentView, setCurrentView] = useState('customer'); // 'customer' or 'cashier'

  return (
    <div className="app-router">
      {/* Navigation Header */}
      <div className="app-navigation">
        <div className="nav-container">
          <div className="nav-logo">
            <img 
              src="https://oxxo.pe/img/logo-r.png" 
              alt="OXXO - Todo Día" 
              className="logo-image"
            />
          </div>
          
          <div className="nav-buttons">
            <button 
              className={`nav-btn ${currentView === 'customer' ? 'active' : ''}`}
              onClick={() => setCurrentView('customer')}
            >
              <ShoppingBag size={20} />
              Cliente
            </button>
            
            <button 
              className={`nav-btn ${currentView === 'cashier' ? 'active' : ''}`}
              onClick={() => setCurrentView('cashier')}
            >
              <Users size={20} />
              Cajero
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="app-content">
        {currentView === 'customer' && <App />}
        {currentView === 'cashier' && <CashierModule />}
      </div>
    </div>
  );
};

export default AppRouter;