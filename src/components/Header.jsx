import React, { useState } from 'react';
import { ShoppingCart, Menu, X, Search, User } from 'lucide-react';
import './Header.css';

const Header = ({ cartItemsCount, onCartClick }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="header">
      {/* Top Bar */}
      <div className="top-bar">
        <div className="container">
          <div className="top-bar-content">
            <div className="contact-info" style={{backgroundColor: '#0066cc', color: '#FFFFFF'}}>
              <span style={{color: '#FFFFFF'}}>📞 (01) 311-4040</span>
              <span style={{color: '#FFFFFF'}}>📍 Encuentra tu OXXO más cercano</span>
            </div>
            <div className="user-actions">
              <button className="user-btn">
                <User size={16} />
                Iniciar Sesión
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="main-header">
        <div className="container">
          <div className="header-content">
            {/* Logo */}
            <div className="logo">
              <img 
                src="https://oxxo.pe/img/logo-r.png" 
                alt="OXXO - Todo Día" 
                className="logo-image"
              />
            </div>

            {/* Search Bar - Desktop */}
            <div className="search-container desktop-only">
              <div className="search-bar">
                <Search className="search-icon" size={20} />
                <input 
                  type="text" 
                  placeholder="¿Qué estás buscando?"
                  className="search-input"
                />
                <button className="search-btn">Buscar</button>
              </div>
            </div>

            {/* Header Actions */}
            <div className="header-actions">
              <button className="cart-btn" onClick={onCartClick}>
                <ShoppingCart size={24} />
                <span className="cart-count">{cartItemsCount}</span>
                <span className="cart-text">Carrito</span>
              </button>

              <button className="menu-toggle" onClick={toggleMenu}>
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>

          {/* Search Bar - Mobile */}
          <div className="search-container mobile-only">
            <div className="search-bar">
              <Search className="search-icon" size={20} />
              <input 
                type="text" 
                placeholder="¿Qué estás buscando?"
                className="search-input"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className={`nav-menu ${isMenuOpen ? 'open' : ''}`}>
        <div className="container">
          <ul className="nav-list">
            <li><a href="#inicio">Inicio</a></li>
            <li><a href="#productos">Productos</a></li>
            <li><a href="#promociones">Promociones</a></li>
            <li><a href="#bebidas">Bebidas</a></li>
            <li><a href="#snacks">Snacks</a></li>
            <li><a href="#despensa">Despensa</a></li>
            <li><a href="#cuidado-personal">Cuidado Personal</a></li>
            <li><a href="#servicios">Servicios</a></li>
          </ul>
        </div>
      </nav>
    </header>
  );
};

export default Header;