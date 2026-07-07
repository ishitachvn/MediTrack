import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, X, Bot } from 'lucide-react';
import { aiAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import AIMessage from './AIMessage';
import ChatInput from './ChatInput';
import './AIChatWidget.css';

const AIChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [chatTitle, setChatTitle] = useState('MediTrack AI Assistant');
  
  const getTimestamp = () => {
    return new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const { user } = useAuth();
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          role: 'assistant',
          content: `👋 Hello, ${user?.name || 'User'}!\n\nI'm your **MediTrack AI Health Agent**.\n\nI can help you understand your medicines and health progress.\n\nTry asking:`,
          timestamp: getTimestamp()
        }
      ]);
    }
  }, [user]);
  
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  
  const messagesEndRef = useRef(null);

  const suggestions = [
    'What medicines do I have today?',
    'Show my health summary.',
    'How am I doing this week?',
    'What is my next medicine?'
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, loading]);

  const updateChatTitle = (question) => {
    const q = question.toLowerCase();
    if (q.includes('medicine') || q.includes('pill') || q.includes('dose')) {
      setChatTitle('Medication Analysis');
    } else if (q.includes('water') || q.includes('drink')) {
      setChatTitle('Hydration Log');
    } else if (q.includes('sleep')) {
      setChatTitle('Sleep Summary');
    } else if (q.includes('exercise') || q.includes('active') || q.includes('workout')) {
      setChatTitle('Exercise Tracking');
    } else if (q.includes('summary') || q.includes('summariz') || q.includes('week') || q.includes('how am i') || q.includes('health')) {
      setChatTitle('Wellness Summary');
    } else {
      setChatTitle('MediTrack AI Assistant');
    }
  };

  const handleSend = async (textToSend) => {
    const prompt = textToSend || inputValue;
    if (!prompt.trim() || loading) return;

    // Determine and update dynamic conversation header title
    updateChatTitle(prompt);

    const userMessage = { 
      role: 'user', 
      content: prompt,
      timestamp: getTimestamp()
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setLoading(true);

    try {
      const res = await aiAPI.chat(prompt);
      const botMessage = { 
        role: 'assistant', 
        content: res.response,
        timestamp: getTimestamp()
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error('AI chat failed:', error);
      setMessages((prev) => [
        ...prev,
        { 
          role: 'assistant', 
          content: 'Sorry, I encountered an issue connecting to the Gemini server. Please try again.',
          timestamp: getTimestamp()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-widget-wrapper">
      {/* Floating circular button */}
      <button 
        className={`ai-floating-btn ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle AI Assistant"
      >
        {isOpen ? <X size={22} /> : <Sparkles size={22} />}
      </button>

      {/* Chat window overlay */}
      {isOpen && (
        <div className="ai-chat-window glass-panel animate-scale-up">
          <header className="ai-chat-header">
            <div className="ai-header-title">
              <Bot size={20} className="ai-header-icon" />
              <div>
                <h4>{chatTitle}</h4>
                <span className="ai-header-status">Online Assistant</span>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="btn-close-chat" title="Close AI Assistant">
              <X size={16} />
            </button>
          </header>

          {/* Messages Container */}
          <div className="ai-messages-container">
            {messages.map((msg, index) => (
              <AIMessage 
                key={index} 
                role={msg.role} 
                content={msg.content} 
                timestamp={msg.timestamp} 
              />
            ))}
            
            {loading && (
              <div className="chat-message-row bot animate-slide-up">
                <div className="message-avatar">
                  <Bot size={16} />
                </div>
                <div className="message-bubble-content">
                  <div className="message-bubble-text loading-bubble">
                    <div className="thinking-title">🤖 MediTrack AI</div>
                    <div className="thinking-steps">
                      <div className="thinking-step step-1">Analyzing your medicines...</div>
                      <div className="thinking-step step-2">Checking today's health logs...</div>
                      <div className="thinking-step step-3">Generating personalized response...</div>
                    </div>
                    <div className="dots-container" style={{ marginTop: '0.2rem' }}>
                      <span className="loading-dot"></span>
                      <span className="loading-dot"></span>
                      <span className="loading-dot"></span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggestions pills panel */}
          {messages.length <= 1 && (
            <div className="ai-suggestions-panel">
              <p className="suggestions-title">Ask me about:</p>
              <div className="suggestions-grid">
                {suggestions.map((sug, idx) => (
                  <button 
                    key={idx} 
                    onClick={() => handleSend(sug)} 
                    className="btn-suggestion-item"
                  >
                    {sug}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <footer className="ai-chat-footer-input">
            <ChatInput
              value={inputValue}
              onChange={setInputValue}
              onSend={() => handleSend()}
              disabled={loading}
            />
          </footer>
        </div>
      )}
    </div>
  );
};

export default AIChatWidget;
