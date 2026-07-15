import React, { useRef, useEffect } from 'react';
import { Send } from 'lucide-react';

const ChatInput = ({ value, onChange, onSend, disabled }) => {
  const textareaRef = useRef(null);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(150, textareaRef.current.scrollHeight)}px`;
    }
  }, [value]);

  return (
    <div className="chat-input-container">
      <textarea
        ref={textareaRef}
        rows={1}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Ask MediTrack AI..."
        disabled={disabled}
        className="chat-textarea-input"
      />
      <button 
        onClick={onSend} 
        disabled={disabled || !value.trim()} 
        className="chat-send-btn"
        title="Send Message"
      >
        <Send size={16} />
      </button>
    </div>
  );
};

export default ChatInput;
