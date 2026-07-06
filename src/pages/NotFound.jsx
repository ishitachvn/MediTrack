import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import './NotFound.css';

const NotFound = () => {
  return (
    <div className="notfound-container">
      <div className="notfound-card glass-panel animate-fade-in">
        <div className="notfound-icon-wrapper">
          <AlertCircle size={48} />
        </div>
        <h1>404</h1>
        <h2>Page Not Found</h2>
        <p>
          We couldn't find the page you are looking for. It might have been moved, deleted,
          or the URL path might contain a typo.
        </p>
        <Link to="/" className="btn-back-home">
          <ArrowLeft size={16} /> Back to Safety
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
