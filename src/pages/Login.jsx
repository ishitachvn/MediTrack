import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Activity, Mail, Lock, Eye, EyeOff, Info } from 'lucide-react';
import Toast from '../components/Toast';
import './Login.css';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  const validate = () => {
    const newErrors = {};
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!password) {
      newErrors.password = 'Password is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await login(email, password);
      setToastType('success');
      setToastMessage('Welcome back! Logging in...');
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (err) {
      setToastType('error');
      setToastMessage(err.message || 'Login failed.');
      setLoading(false);
    }
  };

  // Pre-fill demo credentials
  const fillDemoCredentials = () => {
    setEmail('demo@meditrack.org');
    setPassword('password123');
  };

  return (
    <div className="auth-page-container">
      {toastMessage && (
        <Toast message={toastMessage} type={toastType} onClose={() => setToastMessage('')} />
      )}

      <div className="auth-card glass-panel animate-fade-in">
        <div className="auth-header">
          <Link to="/" className="auth-logo">
            <div className="logo-icon-wrapper">
              <Activity className="logo-icon" size={22} />
            </div>
            <span>MediTrack</span>
          </Link>
          <h2>Welcome Back</h2>
          <p>Login to track medications and check today's adherence stats.</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {/* Email field */}
          <div className="form-group">
            <label htmlFor="login-email">Email Address</label>
            <div className="input-wrapper">
              <Mail className="input-icon" size={18} />
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
                className={errors.email ? 'input-error' : ''}
              />
            </div>
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>

          {/* Password field */}
          <div className="form-group">
            <label htmlFor="login-password">Password</label>
            <div className="input-wrapper">
              <Lock className="input-icon" size={18} />
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={errors.password ? 'input-error' : ''}
              />
              <button
                type="button"
                className="toggle-pw-btn"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && <span className="error-text">{errors.password}</span>}
          </div>

          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading ? (
              <span className="spinner-loader"></span>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Demo Credentials Suggestion Box */}
        <div className="demo-credentials-box" onClick={fillDemoCredentials}>
          <div className="demo-header">
            <Info size={16} />
            <span>Quick Test Demo Credentials</span>
          </div>
          <p>Email: <strong>demo@meditrack.org</strong></p>
          <p>Password: <strong>password123</strong></p>
          <button type="button" className="btn-autofill-demo">Auto-Fill Credentials</button>
        </div>

        <div className="auth-footer-text">
          Don't have an account? <Link to="/register">Register Now</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
