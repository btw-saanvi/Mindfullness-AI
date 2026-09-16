import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Heart, Lightbulb, Brain, Leaf, History, ShieldAlert, CheckCircle2, Target, Wind } from 'lucide-react';
import axios from 'axios';
import { getToken } from '../utils/auth';
import SessionEntryModal from './SessionEntryModal';
import BreathingExercise from './BreathingExercise';
import CBTWorksheet from './CBTWorksheet';
import Logo from './Logo';
import chatBg from '../assets/chatbg.png';

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const ChatInterface = ({ userPreferences }) => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState('calm');

  const [vibe, setVibe] = useState('chill');
  
  const [crisisAlert, setCrisisAlert] = useState(null);
  
  const [showEntryModal, setShowEntryModal] = useState(false);
  const [showBreathing, setShowBreathing] = useState(false);
  const [showCBT, setShowCBT] = useState(false);
  const [summaryModal, setSummaryModal] = useState(null);

  const [sessionId, setSessionId] = useState(null);
  const messagesEndRef = useRef(null);

  const getUserId = () => {
    const existing = localStorage.getItem('mindful_user_id');
    if (existing) return existing;
    const created = `user_${Date.now()}`;
    localStorage.setItem('mindful_user_id', created);
    return created;
  };

  const therapyStyles = [
    { id: 'calm', name: 'Calm', icon: Heart, description: 'Gentle, comforting conversation' },
    { id: 'motivational', name: 'Motivational', icon: Lightbulb, description: 'Encouraging & uplifting support' },
    { id: 'cbt', name: 'CBT', icon: Brain, description: 'Cognitive reframing & structured guidance' },
    { id: 'mindfulness', name: 'Mindfulness', icon: Leaf, description: 'Mindful presence & grounding exercises' }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const welcomeMessage = {
      id: 1,
      type: 'ai',
      text: "Welcome to your reflection space. I am MindfulAI, your mental wellness companion. How are you feeling today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages([welcomeMessage]);
  }, []);

  const handleStartStructuredSession = async ({ need, moodScore }) => {
    setIsLoading(true);
    const userId = getUserId();
    try {
      const res = await axios.post(`${apiUrl}/session/start`, {
        user_id: userId,
        need: need,
        mood_score: moodScore
      });

      setSessionId(res.data.session_id);
      const aiMsg = {
        id: Date.now(),
        type: 'ai',
        text: res.data.starter_message,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      console.warn('Session start error fallback');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEndSession = async () => {
    setIsLoading(true);
    const userId = getUserId();
    try {
      const res = await axios.post(`${apiUrl}/session/end`, {
        user_id: userId,
        session_id: sessionId || 'current'
      });
      setSummaryModal(res.data.summary);
    } catch {
      setSummaryModal("Session summary: Focused on thoughtful reflection and processing emotions. Takeaway: Practice gentle self-compassion today.");
    } finally {
      setIsLoading(false);
    }
  };

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
      const response = await axios.post(`${apiUrl}/chat`, {
        user_id: getUserId(),
        message: text,
        gender: userPreferences?.gender || 'female',
        persona: selectedStyle,
        vibe: vibe,
        journaling: userPreferences?.journaling || false
      }, {
        headers: { Authorization: `Bearer ${getToken()}` },
        timeout: 20000
      });

      if (response.data.is_crisis) {
        setCrisisAlert(response.data.reply);
      } else {
        setCrisisAlert(null);
      }

      const aiMessage = {
        id: Date.now() + 1,
        type: 'ai',
        text: response.data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error sending message:', error);

      // Differentiated error messages based on HTTP status
      let errorText = "I'm having trouble connecting right now, but I'm right here with you. Please try again in a moment.";
      if (error.response) {
        const status = error.response.status;
        if (status === 429) {
          errorText = "The AI service is temporarily busy due to high demand. Please wait a moment and try again.";
        } else if (status === 503) {
          errorText = "The AI service is currently unavailable. Please check your connection and try again shortly.";
        } else if (status === 422) {
          errorText = "There was an issue with your message. Please try rephrasing and sending again.";
        }
      } else if (error.code === 'ERR_NETWORK') {
        errorText = "Unable to reach the server. Please check your internet connection.";
      }

      const errorMessage = {
        id: Date.now() + 1,
        type: 'ai',
        text: errorText,
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
      {/* Modals */}
      <SessionEntryModal
        isOpen={showEntryModal}
        onClose={() => setShowEntryModal(false)}
        onStartSession={handleStartStructuredSession}
      />
      <BreathingExercise
        isOpen={showBreathing}
        onClose={() => setShowBreathing(false)}
      />
      <CBTWorksheet
        isOpen={showCBT}
        onClose={() => setShowCBT(false)}
      />

      {/* Summary Modal */}
      {summaryModal && (
        <div className="breathing-modal-overlay">
          <div className="cbt-modal-card" style={{ maxWidth: 480, textAlign: 'center' }}>
            <CheckCircle2 style={{ width: 44, height: 44, color: 'var(--accent)', margin: '0 auto 12px auto' }} />
            <h2 style={{ fontFamily: 'Syne, sans-serif', color: 'var(--ink)', fontSize: '1.3rem', marginBottom: 12 }}>
              Session Summary & Takeaway
            </h2>
            <div style={{
              background: 'var(--accent-soft)',
              border: '1px solid rgba(26,122,98,0.25)',
              borderRadius: 12,
              padding: 18,
              color: 'var(--ink-soft)',
              fontSize: '0.92rem',
              lineHeight: 1.65,
              textAlign: 'left',
              marginBottom: 20
            }}>
              {summaryModal}
            </div>
            <button className="btn-pastel-blue" onClick={() => setSummaryModal(null)}>
              Close & Log Session
            </button>
          </div>
        </div>
      )}

      {/* Chat Header */}
      <div className="chat-header">
        <div className="chat-chrome-left">
          <button className="back-button" onClick={() => navigate('/')} title="Home">
            <ArrowLeft style={{ width: 18, height: 18 }} />
          </button>
          <span className="product-dot" />
          <span className="product-dot" />
          <span className="product-dot" />
          <Logo size="small" variant="dark" onClick={() => navigate('/')} />
          <span className="chat-chrome-label">MindfulAI / Session</span>
          <div className="companion-orb-container">
            <div className={`listening-orb ${isLoading ? 'active' : ''}`}></div>
            <span>{isLoading ? 'Reflecting...' : 'Listening'}</span>
          </div>
        </div>

        <div className="tools-bar">
          <button className="tool-chip" onClick={() => setShowEntryModal(true)}>
            <Target style={{ width: 14, height: 14 }} /> 1.0 Need
          </button>
          <button className="tool-chip" onClick={() => setShowBreathing(true)}>
            <Wind style={{ width: 14, height: 14 }} /> Breathing
          </button>
          <button className="tool-chip" onClick={() => setShowCBT(true)}>
            <Brain style={{ width: 14, height: 14 }} /> CBT
          </button>
          <button className="tool-chip" onClick={handleEndSession}>
            <CheckCircle2 style={{ width: 14, height: 14 }} /> End
          </button>
          <button className="view-history-button" onClick={() => navigate('/dashboard')}>
            Dashboard
          </button>
        </div>
      </div>

      <div className="chat-layout">
        {/* Main Chat Area */}
        <div className="main-chat" style={{
          backgroundImage: `linear-gradient(rgba(12, 13, 16, 0.85), rgba(12, 13, 16, 0.85)), url(${chatBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}>
          <div className="messages-container">
            {crisisAlert && (
              <div className="crisis-banner">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600, marginBottom: 6, color: '#fca5a5' }}>
                  <ShieldAlert style={{ width: 20, height: 20 }} />
                  Immediate Support Resources Available
                </div>
                <div style={{ whiteSpace: 'pre-line' }}>{crisisAlert}</div>
              </div>
            )}

            <AnimatePresence>
              {messages.map((message, index) => (
                <motion.div
                  key={message.id}
                  className={`message ${message.type}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.04 }}
                >
                  <div className="message-content">
                    <p>{message.text}</p>
                    <span className="message-time">{message.timestamp}</span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {isLoading && (
              <div className="message ai">
                <div className="message-content">
                  <p style={{ color: 'rgba(255,255,255,0.45)', fontStyle: 'italic', margin: 0 }}>MindfulAI is thinking thoughtfully...</p>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input Bar */}
          <div className="input-container">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Share what is on your mind..."
              className="message-input"
            />
            <button
              className="send-button"
              onClick={handleSend}
              disabled={!inputMessage.trim() || isLoading}
            >
              <Send style={{ width: 18, height: 18 }} />
            </button>
          </div>
        </div>

        {/* Sidebar */}
        <div className="chat-sidebar">
          {/* Tone Vibe Switcher */}
          <div style={{ marginBottom: 24, background: 'rgba(255,255,255,0.03)', padding: 14, borderRadius: 12, border: '1px solid rgba(255,255,255,0.08)' }}>
            <label style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.88rem', fontWeight: 500, display: 'block', marginBottom: 8 }}>
              Response Tone Vibe:
            </label>
            <div style={{ display: 'flex', gap: 6 }}>
              {[
                { id: 'chill', label: 'Chill' },
                { id: 'grounded', label: 'Grounded' },
                { id: 'hype', label: 'Uplifting' }
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => setVibe(item.id)}
                  style={{
                    flex: 1,
                    padding: '6px 8px',
                    borderRadius: 8,
                    border: vibe === item.id ? '1px solid rgba(125,211,176,0.5)' : '1px solid transparent',
                    background: vibe === item.id ? 'rgba(26,122,98,0.2)' : 'transparent',
                    color: vibe === item.id ? '#7dd3b0' : 'rgba(255,255,255,0.45)',
                    cursor: 'pointer',
                    fontSize: '0.82rem'
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="therapy-style-section">
            <h3>Therapeutic Style</h3>
            <p>Select your reflection approach</p>
            
            <div className="therapy-options">
              {therapyStyles.map((style) => {
                const IconComponent = style.icon;
                return (
                  <button
                    key={style.id}
                    className={`therapy-option ${selectedStyle === style.id ? 'selected' : ''}`}
                    onClick={() => setSelectedStyle(style.id)}
                  >
                    <IconComponent className="therapy-icon" />
                    <div className="therapy-info">
                      <h4>{style.name}</h4>
                      <p>{style.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="disclaimer-bar">
        MindfulAI is a reflection & wellness companion — not a replacement for licensed medical or clinical care.
      </div>
    </div>
  );
};

export default ChatInterface;
