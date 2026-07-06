import React, { useEffect } from 'react';
import './Toast.css';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

const Toast = ({ message, type = 'info', onClose, duration = 4000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="toast-icon success" />;
      case 'error':
        return <AlertCircle className="toast-icon error" />;
      case 'warning':
        return <AlertTriangle className="toast-icon warning" />;
      default:
        return <Info className="toast-icon info" />;
    }
  };

  return (
    <div className={`toast-container animate-fade-in ${type}`}>
      {getIcon()}
      <div className="toast-content">{message}</div>
      <button onClick={onClose} className="toast-close-btn" aria-label="Close notification">
        <X size={16} />
      </button>
    </div>
  );
};

export default Toast;
