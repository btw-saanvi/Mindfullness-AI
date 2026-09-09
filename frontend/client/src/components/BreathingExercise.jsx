import { useState, useEffect } from 'react';
import { X, Play, Pause, Eye, Hand, Volume2, Sparkles, MessageCircle } from 'lucide-react';

const BreathingExercise = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('breathing'); // breathing | grounding
  const [phase, setPhase] = useState('inhale'); // inhale | hold | exhale
  const [countdown, setCountdown] = useState(4);
  const [isRunning, setIsRunning] = useState(true);

  if (!isOpen) return null;

  useEffect(() => {
    if (!isRunning || activeTab !== 'breathing') return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev > 1) return prev - 1;

        if (phase === 'inhale') {
          setPhase('hold');
          return 7;
        } else if (phase === 'hold') {
          setPhase('exhale');
          return 8;
        } else {
          setPhase('inhale');
          return 4;
        }
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isRunning, phase, activeTab]);

  const getPhaseText = () => {
    if (phase === 'inhale') return 'Inhale Deeply (4s)';
    if (phase === 'hold') return 'Hold Breath (7s)';
    return 'Slow Exhale (8s)';
  };

  return (
    <div className="breathing-modal-overlay">
      <div className="breathing-card">
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: 20, right: 20, background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
        >
          <X style={{ width: 20, height: 20 }} />
        </button>

        {/* Tab Selection */}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 24 }}>
          <button
            onClick={() => setActiveTab('breathing')}
            style={{
              padding: '6px 16px',
              borderRadius: 20,
              border: activeTab === 'breathing' ? '1px solid #7dd3fc' : '1px solid transparent',
              background: activeTab === 'breathing' ? 'rgba(125,211,252,0.15)' : 'transparent',
              color: activeTab === 'breathing' ? '#7dd3fc' : '#94a3b8',
              cursor: 'pointer',
              fontSize: '0.88rem'
            }}
          >
            4-7-8 Breathing
          </button>
          <button
            onClick={() => setActiveTab('grounding')}
            style={{
              padding: '6px 16px',
              borderRadius: 20,
              border: activeTab === 'grounding' ? '1px solid #7dd3fc' : '1px solid transparent',
              background: activeTab === 'grounding' ? 'rgba(125,211,252,0.15)' : 'transparent',
              color: activeTab === 'grounding' ? '#7dd3fc' : '#94a3b8',
              cursor: 'pointer',
              fontSize: '0.88rem'
            }}
          >
            5-4-3-2-1 Grounding
          </button>
        </div>

        {activeTab === 'breathing' ? (
          <div>
            <h2 style={{ fontFamily: 'Outfit', fontSize: '1.4rem', color: '#f8fafc', margin: '0 0 6px 0' }}>
              Guided Breathing
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: 0 }}>
              Follow the rhythm to soothe your nervous system
            </p>

            {/* Breathing Animated Circle */}
            <div className="breathing-circle-outer">
              <div className={`breathing-circle-inner ${phase}`}>
                <div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 600 }}>{countdown}</div>
                  <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: 1 }}>{phase}</div>
                </div>
              </div>
            </div>

            <div style={{ color: '#7dd3fc', fontWeight: 500, fontSize: '1.05rem', marginBottom: 20 }}>
              {getPhaseText()}
            </div>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button
                className="btn-outline-warm"
                onClick={() => setIsRunning(!isRunning)}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
              >
                {isRunning ? <Pause style={{ width: 16, height: 16 }} /> : <Play style={{ width: 16, height: 16 }} />}
                {isRunning ? 'Pause' : 'Resume'}
              </button>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'left' }}>
            <h2 style={{ fontFamily: 'Outfit', fontSize: '1.3rem', color: '#f8fafc', marginBottom: 6 }}>
              5-4-3-2-1 Sensory Grounding
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '0.88rem', marginBottom: 20 }}>
              A technique to bring your focus back to the present moment:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { num: '5', icon: Eye, text: 'Things you can SEE around you' },
                { num: '4', icon: Hand, text: 'Things you can TOUCH or FEEL' },
                { num: '3', icon: Volume2, text: 'Sounds you can HEAR' },
                { num: '2', icon: Sparkles, text: 'Things you can SMELL' },
                { num: '1', icon: MessageCircle, text: 'Positive thing you can SAY to yourself' }
              ].map(item => {
                const Icon = item.icon;
                return (
                  <div key={item.num} style={{ display: 'flex', alignItems: 'center', gap: 14, background: 'rgba(255,255,255,0.03)', padding: 12, borderRadius: 10, border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(125,211,252,0.15)', color: '#7dd3fc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600 }}>
                      <Icon style={{ width: 16, height: 16 }} />
                    </div>
                    <div style={{ color: '#f8fafc', fontSize: '0.9rem' }}>{item.text}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BreathingExercise;
