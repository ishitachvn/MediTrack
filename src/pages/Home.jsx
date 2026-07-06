import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Heart, ShieldAlert, Award, Clock, ArrowRight, CheckCircle2, 
  Smartphone, BarChart3, Droplet, UserCheck, Mail, Phone, MapPin, ExternalLink,
  Activity
} from 'lucide-react';
import './Home.css';

const Home = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-inner">
          <div className="hero-content animate-fade-in">
            <span className="badge">SDG 3: Good Health & Well-Being</span>
            <h1>Your Intelligent Companion for Medication Adherence</h1>
            <p>
              MediTrack helps individuals, patients, and caregivers manage complex medication schedules,
              track daily wellness metrics, and achieve a healthier lifestyle through automation.
            </p>
            <div className="hero-actions">
              {isAuthenticated ? (
                <Link to="/dashboard" className="btn-primary-hero">
                  Go to Dashboard <ArrowRight size={18} />
                </Link>
              ) : (
                <>
                  <Link to="/register" className="btn-primary-hero">
                    Get Started Free <ArrowRight size={18} />
                  </Link>
                  <Link to="/login" className="btn-secondary-hero">
                    Log In
                  </Link>
                </>
              )}
            </div>
          </div>

          <div className="hero-visual-wrapper animate-float">
            <div className="hero-glass-visual">
              {/* Inline Premium Healthcare SVG */}
              <svg viewBox="0 0 500 500" width="100%" height="100%" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Background grid/dots */}
                <circle cx="100" cy="100" r="2" fill="var(--primary)" opacity="0.3" />
                <circle cx="200" cy="80" r="3" fill="var(--secondary)" opacity="0.4" />
                <circle cx="400" cy="120" r="2" fill="var(--primary)" opacity="0.3" />
                <circle cx="450" cy="300" r="3" fill="var(--secondary)" opacity="0.3" />

                {/* Big pulse circles */}
                <circle cx="250" cy="250" r="160" stroke="url(#paint0_linear)" strokeWidth="2" strokeDasharray="5 5" opacity="0.6" />
                <circle cx="250" cy="250" r="120" stroke="url(#paint1_linear)" strokeWidth="1.5" opacity="0.8" />
                <circle cx="250" cy="250" r="80" fill="url(#paint2_radial)" opacity="0.15" />

                {/* Beating Heart Icon */}
                <path d="M250 290L228.5 268.5C203 243 180 220 180 190C180 162.5 202.5 140 230 140C245.5 140 260.5 147.5 270 160C279.5 147.5 294.5 140 310 140C337.5 140 360 162.5 360 190C360 220 337 243 311.5 268.5L250 290Z" 
                  fill="url(#heartGrad)" 
                  filter="url(#shadowFilter)"
                />

                {/* Heart Rate / EKG Line */}
                <path d="M100 250H180L195 210L210 300L225 180L240 270L250 250H400" 
                  stroke="url(#ekgGrad)" 
                  strokeWidth="4" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                />

                {/* Floating medicine elements */}
                <g className="floating-pill">
                  <rect x="340" y="80" width="60" height="24" rx="12" fill="var(--primary)" transform="rotate(30 340 80)" />
                  <rect x="370" y="80" width="30" height="24" rx="12" fill="var(--secondary)" transform="rotate(30 340 80)" opacity="0.8" />
                </g>
                <g className="floating-pill-2">
                  <circle cx="110" cy="380" r="16" fill="var(--warning)" opacity="0.9" />
                  <line x1="98" y1="380" x2="122" y2="380" stroke="white" strokeWidth="3" />
                </g>

                {/* Gradients */}
                <defs>
                  <linearGradient id="paint0_linear" x1="90" y1="90" x2="410" y2="410" gradientUnits="userSpaceOnUse">
                    <stop stopColor="var(--primary)" />
                    <stop offset="1" stopColor="var(--secondary)" />
                  </linearGradient>
                  <linearGradient id="paint1_linear" x1="130" y1="130" x2="370" y2="370" gradientUnits="userSpaceOnUse">
                    <stop stopColor="var(--secondary)" />
                    <stop offset="1" stopColor="var(--primary)" />
                  </linearGradient>
                  <radialGradient id="paint2_radial" cx="250" cy="250" r="80" gradientUnits="userSpaceOnUse">
                    <stop stopColor="var(--primary)" />
                    <stop offset="1" stopColor="var(--primary)" stopOpacity="0" />
                  </radialGradient>
                  <linearGradient id="heartGrad" x1="180" y1="140" x2="360" y2="290" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#ff4b5c" />
                    <stop offset="1" stopColor="#ff7b88" />
                  </linearGradient>
                  <linearGradient id="ekgGrad" x1="100" y1="250" x2="400" y2="250" gradientUnits="userSpaceOnUse">
                    <stop stopColor="var(--primary)" />
                    <stop offset="0.5" stopColor="var(--secondary)" />
                    <stop offset="1" stopColor="var(--primary)" />
                  </linearGradient>
                  <filter id="shadowFilter" x="160" y="120" width="220" height="200" filterUnits="userSpaceOnUse">
                    <stop stopColor="#000" stopOpacity="0.3" />
                    <feDropShadow dx="0" dy="8" stdDeviation="6" floodColor="#ff4b5c" floodOpacity="0.4" />
                  </filter>
                </defs>
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Counter Section */}
      <section className="stats-section">
        <div className="stats-grid">
          <div className="stat-card glass-panel">
            <span className="stat-num">95%+</span>
            <span className="stat-label">Adherence Success Rate</span>
          </div>
          <div className="stat-card glass-panel">
            <span className="stat-num">10k+</span>
            <span className="stat-label">Reminders Logged Daily</span>
          </div>
          <div className="stat-card glass-panel">
            <span className="stat-num">30%</span>
            <span className="stat-label">Average Adherence Improvement</span>
          </div>
          <div className="stat-card glass-panel">
            <span className="stat-num">SDG 3</span>
            <span className="stat-label">Global Health Alignment</span>
          </div>
        </div>
      </section>

      {/* SDG 3 Alignment Section */}
      <section className="sdg-section">
        <div className="sdg-inner glass-panel">
          <div className="sdg-badge">Global Goals Alignment</div>
          <h2>SDG 3: Good Health and Well-Being</h2>
          <p className="sdg-subtitle">
            Target 3.8: Achieve universal health coverage, access to quality essential healthcare services, 
            and access to safe, effective, quality, and affordable essential medicines.
          </p>
          <div className="sdg-features">
            <div className="sdg-feature-item">
              <CheckCircle2 className="sdg-icon" />
              <div>
                <h4>Responsible Medicine Adherence</h4>
                <p>Preventing antibiotic resistance and secondary complications by supporting correct consumption.</p>
              </div>
            </div>
            <div className="sdg-feature-item">
              <CheckCircle2 className="sdg-icon" />
              <div>
                <h4>Universal Wellness Tracking</h4>
                <p>Keeping water, sleep, and exercise in check to promote comprehensive preventative health.</p>
              </div>
            </div>
            <div className="sdg-feature-item">
              <CheckCircle2 className="sdg-icon" />
              <div>
                <h4>Reduce Disease Burden</h4>
                <p>Helping chronic patients follow their guidelines to prevent emergency clinical readmissions.</p>
              </div>
            </div>
          </div>
          <a 
            href="https://sdgs.un.org/goals/goal3" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="sdg-link-btn"
          >
            Learn more about SDG 3 <ExternalLink size={16} />
          </a>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="section-header">
          <h2>Everything You Need for Active Care</h2>
          <p>An all-in-one health suite designed to be simple, interactive, and transparent.</p>
        </div>

        <div className="features-grid">
          <div className="feature-card glass-panel">
            <div className="feat-icon-wrapper primary-icon">
              <Clock size={24} />
            </div>
            <h3>Smart Reminders</h3>
            <p>Schedule your medicine doses at precise hours. Get instant visual indicator changes and daily ticks.</p>
          </div>

          <div className="feature-card glass-panel">
            <div className="feat-icon-wrapper secondary-icon">
              <BarChart3 size={24} />
            </div>
            <h3>Detailed Adherence Insights</h3>
            <p>Review interactive reports of taken vs. missed pills using clean responsive charts.</p>
          </div>

          <div className="feature-card glass-panel">
            <div className="feat-icon-wrapper warning-icon">
              <Droplet size={24} />
            </div>
            <h3>Integrated Health Tracking</h3>
            <p>Log your daily water intake, exercise duration, and sleep schedules to keep habits aligned.</p>
          </div>

          <div className="feature-card glass-panel">
            <div className="feat-icon-wrapper accent-icon">
              <UserCheck size={24} />
            </div>
            <h3>Sleek Profile & Goals</h3>
            <p>Store your baseline blood groups, personal objectives, and change credentials dynamically.</p>
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="home-footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <div className="footer-logo">
              <Activity className="logo-icon" size={20} />
              <span>MediTrack</span>
            </div>
            <p>Empowering healthy routines and contributing to SDG 3 globally.</p>
          </div>

          <div className="footer-contacts">
            <h4>Contact Info</h4>
            <ul>
              <li><Mail size={16} /> support@meditrack-sdg.org</li>
              <li><Phone size={16} /> +1 (800) 555-0199</li>
              <li><MapPin size={16} /> Health Tech Square, SDG City</li>
            </ul>
          </div>

          <div className="footer-copyright">
            <p>&copy; {new Date().getFullYear()} MediTrack. Developed for SDG 3 College Research Initiative.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
