import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Activity, Menu, X, LogOut, User, LayoutDashboard, PlusCircle, ClipboardList, Heart } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/');
    setTimeout(() => {
      logout();
    }, 50);
    setMobileMenuOpen(false);
  };

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <nav className="navbar-container">
      <div className="navbar-inner">
        {/* Logo */}
        <Link to="/" className="navbar-logo" onClick={closeMobileMenu}>
          <div className="logo-icon-wrapper">
            <Activity className="logo-icon" size={24} />
          </div>
          <span className="logo-text">MediTrack</span>
        </Link>

        {/* Desktop Menu */}
        <div className="navbar-links desktop-only">
          <NavLink to="/" end className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            Home
          </NavLink>
          
          {isAuthenticated ? (
            <>
              <NavLink to="/dashboard" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
                <LayoutDashboard size={18} className="link-icon" /> Dashboard
              </NavLink>
              <NavLink to="/add-medicine" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
                <PlusCircle size={18} className="link-icon" /> Add Medicine
              </NavLink>
              <NavLink to="/health-tracker" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
                <Heart size={18} className="link-icon" /> Health Tracker
              </NavLink>
              <NavLink to="/profile" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
                <User size={18} className="link-icon" /> Profile
              </NavLink>
            </>
          ) : null}
        </div>

        {/* Desktop Buttons */}
        <div className="navbar-actions desktop-only">
          {isAuthenticated ? (
            <div className="auth-profile-group">
              <span className="welcome-name">Hello, <strong>{user?.name}</strong></span>
              <button onClick={handleLogout} className="btn-logout" title="Log Out">
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <div className="auth-btn-group">
              <Link to="/login" className="btn-login-nav">Log In</Link>
              <Link to="/register" className="btn-register-nav">Get Started</Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          className="mobile-menu-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="mobile-menu-overlay" onClick={closeMobileMenu}>
          <div className="mobile-menu-drawer animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <div className="mobile-drawer-header">
              <Link to="/" className="navbar-logo" onClick={closeMobileMenu}>
                <Activity className="logo-icon" size={24} />
                <span className="logo-text">MediTrack</span>
              </Link>
              <button className="mobile-menu-toggle" onClick={closeMobileMenu}>
                <X size={24} />
              </button>
            </div>
            
            <div className="mobile-drawer-links">
              <NavLink to="/" end className="mobile-nav-link" onClick={closeMobileMenu}>
                Home
              </NavLink>

              {isAuthenticated ? (
                <>
                  <NavLink to="/dashboard" className="mobile-nav-link" onClick={closeMobileMenu}>
                    <LayoutDashboard size={20} className="link-icon" /> Dashboard
                  </NavLink>
                  <NavLink to="/add-medicine" className="mobile-nav-link" onClick={closeMobileMenu}>
                    <PlusCircle size={20} className="link-icon" /> Add Medicine
                  </NavLink>
                  <NavLink to="/health-tracker" className="mobile-nav-link" onClick={closeMobileMenu}>
                    <Heart size={20} className="link-icon" /> Health Tracker
                  </NavLink>
                  <NavLink to="/profile" className="mobile-nav-link" onClick={closeMobileMenu}>
                    <User size={20} className="link-icon" /> Profile
                  </NavLink>
                  <button onClick={handleLogout} className="mobile-nav-link mobile-logout-btn">
                    <LogOut size={20} className="link-icon" /> Logout
                  </button>
                </>
              ) : (
                <div className="mobile-auth-buttons">
                  <Link to="/login" className="btn-login-mobile" onClick={closeMobileMenu}>Log In</Link>
                  <Link to="/register" className="btn-register-mobile" onClick={closeMobileMenu}>Get Started</Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
