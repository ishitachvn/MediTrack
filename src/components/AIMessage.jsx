import React from 'react';
import { Bot, User } from 'lucide-react';
import MarkdownText from './MarkdownText';

const AIMessage = ({ role, content, timestamp }) => {
  const isBot = role === 'assistant' || role === 'bot';

  return (
    <div className={`chat-message-row ${isBot ? 'bot' : 'user'}`}>
      <div className="message-avatar">
        {isBot ? <Bot size={16} /> : <User size={16} />}
      </div>
      <div className="message-bubble-content">
        <MarkdownText 
          text={content}
          className="message-bubble-text"
        />
        {timestamp && <span className="message-timestamp">{timestamp}</span>}
      </div>
    </div>
  );
};

export default AIMessage;
