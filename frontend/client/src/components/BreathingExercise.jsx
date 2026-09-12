import { useState, useEffect } from 'react';
import { X, Play, Pause, Eye, Hand, Volume2, Sparkles, MessageCircle } from 'lucide-react';

const BreathingExercise = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('breathing');
  const [phase, setPhase] = useState('inhale');
  const [countdown, setCountdown] = useState(4);
  const [isRunning, setIsRunning] = useState(true);

  useEffect(() => {
    if (!isOpen || !isRunning || activeTab !== 'breathing') return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev > 1) return prev - 1;

        if (phase === 'inhale') {
          setPhase('hold');
          return 7;
        }
        if (phase === 'hold') {
          setPhase('exhale');
          return 8;
        }
        setPhase('inhale');
        return 4;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, isRunning, phase, activeTab]);

  if (!isOpen) return null;

  const getPhaseText = () => {
    if (phase === 'inhale') return 'Inhale Deeply (4s)';
    if (phase === 'hold') return 'Hold Breath (7s)';
    return 'Slow Exhale (8s)';
  };

  const tabStyle = (active) => ({
    padding: '6px 16px',
    borderRadius: 20,
    border: active ? '1px solid var(--accent)' : '1px solid transparent',
    background: active ? 'var(--accent-soft)' : 'transparent',
    color: active ? 'var(--accent)' : 'var(--muted)',
    cursor: 'pointer',
    fontSize: '0.88rem',
    fontWeight: 550,
  });

  return (
    <div className="breathing-modal-overlay">
      <div className="breathing-card">
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: 20, right: 20, background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer' }}
        >
          <X style={{ width: 20, height: 20 }} />
        </button>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 24 }}>
          <button onClick={() => setActiveTab('breathing')} style={tabStyle(activeTab === 'breathing')}>
            4-7-8 Breathing
          </button>
          <button onClick={() => setActiveTab('grounding')} style={tabStyle(activeTab === 'grounding')}>
            5-4-3-2-1 Grounding
          </button>
        </div>

        {activeTab === 'breathing' ? (
          <div>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '1.4rem', color: 'var(--ink)', margin: '0 0 6px 0' }}>
              Guided Breathing
            </h2>
            <p style={{ color: 'var(--muted)', fontSize: '0.9rem', margin: 0 }}>
              Follow the rhythm to soothe your nervous system
            </p>

            <div className="breathing-circle-outer">
              <div className={`breathing-circle-inner ${phase}`}>
                <div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 600 }}>{countdown}</div>
                  <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: 1 }}>{phase}</div>
                </div>
              </div>
            </div>

            <div style={{ color: 'var(--accent)', fontWeight: 550, fontSize: '1.05rem', marginBottom: 20 }}>
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
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '1.3rem', color: 'var(--ink)', marginBottom: 6 }}>
              5-4-3-2-1 Sensory Grounding
            </h2>
            <p style={{ color: 'var(--muted)', fontSize: '0.88rem', marginBottom: 20 }}>
              A technique to bring your focus back to the present moment:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { num: '5', icon: Eye, text: 'Things you can SEE around you' },
                { num: '4', icon: Hand, text: 'Things you can TOUCH or FEEL' },
                { num: '3', icon: Volume2, text: 'Sounds you can HEAR' },
                { num: '2', icon: Sparkles, text: 'Things you can SMELL' },
                { num: '1', icon: MessageCircle, text: 'Positive thing you can SAY to yourself' },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.num}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 14,
                      background: 'var(--bg)',
                      padding: 12,
                      borderRadius: 10,
                      border: '1px solid var(--line)',
                    }}
                  >
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        background: 'var(--accent-soft)',
                        color: 'var(--accent)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 600,
                      }}
                    >
                      <Icon style={{ width: 16, height: 16 }} />
                    </div>
                    <div style={{ color: 'var(--ink)', fontSize: '0.9rem' }}>{item.text}</div>
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
