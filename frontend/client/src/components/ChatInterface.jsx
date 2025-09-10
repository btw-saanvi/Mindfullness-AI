import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Heart, Lightbulb, Brain, Leaf, History, Sparkles } from 'lucide-react';
import axios from 'axios';
import { getToken } from '../utils/auth';

const ChatInterface = ({ userPreferences }) => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState('calm');
  const [genZEnabled, setGenZEnabled] = useState(!!userPreferences?.genz);
  const messagesEndRef = useRef(null);

  const getUserId = () => {
    const existing = localStorage.getItem('mindful_user_id');
    if (existing) return existing;
    const created = `user_${Date.now()}`;
    localStorage.setItem('mindful_user_id', created);
    return created;
  };

  const therapyStyles = [
    { 
      id: 'calm', 
      name: 'Calm', 
      icon: Heart, 
      description: 'Gentle and soothing conversations',
      color: '#60a5fa'
    },
    { 
      id: 'motivational', 
      name: 'Motivational', 
      icon: Lightbulb, 
      description: 'Encouraging and uplifting support',
      color: '#a78bfa'
    },
    { 
      id: 'cbt', 
      name: 'CBT', 
      icon: Brain, 
      description: 'Cognitive behavioral therapy techniques',
      color: '#f59e0b'
    },
    { 
      id: 'mindfulness', 
      name: 'Mindfulness', 
      icon: Leaf, 
      description: 'Mindful awareness and presence',
      color: '#10b981'
    }
  ];

  const sessionTips = [
    'Be honest about your feelings',
    'Take your time to respond',
    'Switch styles anytime',
    'Your privacy is protected'
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Add welcome message
  useEffect(() => {
    const welcomeMessage = {
      id: 1,
      type: 'ai',
      text: "Hello! I'm here to listen and support you. How are you feeling today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages([welcomeMessage]);
  }, []);

  const sendMessage = async (text) => {
    if (!text.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      text: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await axios.post('http://localhost:8000/chat', {
        user_id: getUserId(),
        message: text,
        gender: userPreferences.gender,
        persona: selectedStyle,
        genz: genZEnabled,
        journaling: userPreferences.journaling
      }, { headers: { Authorization: `Bearer ${getToken()}` } });

      const aiMessage = {
        id: Date.now() + 1,
        type: 'ai',
        text: response.data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        id: Date.now() + 1,
        type: 'ai',
        text: "I'm having trouble connecting right now, but I'm here for you. Please try again in a moment.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = () => {
    sendMessage(inputMessage);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="chat-interface">
      {/* Header */}
      <div className="chat-header">
        <button className="back-button" onClick={() => navigate('/')}>
          <ArrowLeft />
        </button>
        
        <div className="header-content">
          <h1>AI Therapy Session</h1>
          <p>Gentle and soothing conversations</p>
        </div>

        <div className="header-actions-right">
          <div className={`genz-toggle ${genZEnabled ? 'active' : ''}`} onClick={() => setGenZEnabled(!genZEnabled)}>
            <Sparkles className="genz-icon" />
            <span>Gen Z Mode</span>
            <div className={`switch ${genZEnabled ? 'on' : ''}`}></div>
          </div>

          <button className="view-history-button" onClick={() => navigate('/history')}>
            <History />
            View History
          </button>
        </div>
      </div>

      <div className="chat-layout">
        {/* Main Chat Area */}
        <div className="main-chat">
          {/* Messages */}
          <div className="messages-container">
            <AnimatePresence>
              {messages.map((message, index) => (
                <motion.div
                  key={message.id}
                  className={`message ${message.type}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <div className="message-content">
                    <p>{message.text}</p>
                    <span className="message-time">{message.timestamp}</span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {isLoading && (
              <motion.div
                className="message ai loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="message-content">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </motion.div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="input-container">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Share what's on your mind..."
              className="message-input"
            />
            <motion.button
              className="send-button"
              onClick={handleSend}
              disabled={!inputMessage.trim() || isLoading}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Send />
            </motion.button>
          </div>
        </div>

        {/* Sidebar */}
        <div className="chat-sidebar">
          {/* Therapy Style Section */}
          <div className="therapy-style-section">
            <h3>Therapy Style</h3>
            <p>Choose the approach that feels right for you</p>
            
            <div className="therapy-options">
              {therapyStyles.map((style) => {
                const IconComponent = style.icon;
                return (
                  <motion.button
                    key={style.id}
                    className={`therapy-option ${selectedStyle === style.id ? 'selected' : ''}`}
                    onClick={() => setSelectedStyle(style.id)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    style={{ '--style-color': style.color }}
                  >
                    <IconComponent className="therapy-icon" />
                    <div className="therapy-info">
                      <h4>{style.name}</h4>
                      <p>{style.description}</p>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Session Tips Section */}
          <div className="session-tips-section">
            <h3>Session Tips</h3>
            <ul className="tips-list">
              {sessionTips.map((tip, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  {tip}
                </motion.li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
