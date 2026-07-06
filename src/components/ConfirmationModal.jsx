import React from 'react';
import './ConfirmationModal.css';
import { AlertTriangle, X } from 'lucide-react';

const ConfirmationModal = ({ isOpen, title, message, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container glass-panel animate-fade-in">
        <div className="modal-header">
          <div className="modal-title-wrapper">
            <AlertTriangle className="modal-warn-icon" size={24} />
            <h3>{title}</h3>
          </div>
          <button onClick={onCancel} className="modal-close-btn" aria-label="Close modal">
            <X size={20} />
          </button>
        </div>
        <div className="modal-body">
          <p>{message}</p>
        </div>
        <div className="modal-footer">
          <button onClick={onCancel} className="btn-secondary">
            Cancel
          </button>
          <button onClick={onConfirm} className="btn-danger">
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
