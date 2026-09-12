import { useState } from 'react';
import { X, ArrowRight, MessageSquare, RefreshCw, Wind, Target, CloudRain, Cloud, CloudSun, Sun } from 'lucide-react';

const SessionEntryModal = ({ isOpen, onClose, onStartSession }) => {
  const [need, setNeed] = useState('vent');
  const [moodScore, setMoodScore] = useState(5);

  if (!isOpen) return null;

  const getMoodConfig = (score) => {
    if (score <= 3) return { icon: CloudRain, text: 'Feeling heavy / anxious', color: 'var(--muted)' };
    if (score <= 6) return { icon: Cloud, text: 'Feeling neutral / okay', color: 'var(--accent)' };
    if (score <= 8) return { icon: CloudSun, text: 'Feeling calm / grounded', color: 'var(--accent)' };
    return { icon: Sun, text: 'Feeling bright / positive', color: 'var(--accent)' };
  };

  const currentMood = getMoodConfig(moodScore);
  const MoodIcon = currentMood.icon;

  const handleSubmit = () => {
    onStartSession({ need, moodScore });
    onClose();
  };

  return (
    <div className="breathing-modal-overlay">
      <div className="cbt-modal-card" style={{ maxWidth: 480 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '1.4rem', margin: 0, color: 'var(--ink)' }}>
            Start a Reflection Session
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer' }}>
            <X style={{ width: 20, height: 20 }} />
          </button>
        </div>

        {/* Pick Need */}
        <div style={{ marginBottom: 24 }}>
          <label style={{ color: 'var(--ink-soft)', fontSize: '0.92rem', fontWeight: 500, display: 'block', marginBottom: 10 }}>
            What is your primary need right now?
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {[
              { id: 'vent', icon: MessageSquare, title: 'Vent Thoughts', desc: 'Unpack what is on your mind' },
              { id: 'reframe', icon: RefreshCw, title: 'Reframe Thought', desc: 'Work through an anxious idea' },
              { id: 'calm', icon: Wind, title: 'Calm Down', desc: 'Grounding & gentle breathing' },
              { id: 'intention', icon: Target, title: 'Set Intention', desc: 'Focus on today’s energy' }
            ].map(item => {
              const Icon = item.icon;
              const isSel = need === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setNeed(item.id)}
                  style={{
                    padding: 14,
                    borderRadius: 12,
                    border: isSel ? '1px solid var(--accent)' : '1px solid var(--line)',
                    background: isSel ? 'var(--accent-soft)' : 'var(--bg)',
                    color: 'var(--ink)',
                    textAlign: 'left',
                    cursor: 'pointer'
                  }}
                >
                  <Icon style={{ width: 20, height: 20, color: isSel ? 'var(--accent)' : 'var(--muted)', marginBottom: 6 }} />
                  <div style={{ fontWeight: 600, fontSize: '0.92rem', color: isSel ? 'var(--accent)' : 'var(--ink)' }}>{item.title}</div>
                  <div style={{ color: 'var(--muted)', fontSize: '0.78rem' }}>{item.desc}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Mood Slider */}
        <div style={{ marginBottom: 28, background: 'var(--bg)', padding: 18, borderRadius: 12, border: '1px solid var(--line)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ color: 'var(--ink-soft)', fontSize: '0.9rem', fontWeight: 500 }}>Daily Mood Check-in:</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: currentMood.color, fontWeight: 600, fontSize: '0.95rem' }}>
              <MoodIcon style={{ width: 18, height: 18 }} />
              {moodScore}/10
            </div>
          </div>

          <input
            type="range"
            min="1"
            max="10"
            value={moodScore}
            onChange={(e) => setMoodScore(parseInt(e.target.value))}
            style={{
              width: '100%',
              accentColor: 'var(--accent)',
              cursor: 'pointer',
              marginBottom: 8
            }}
          />

          <div style={{ textAlign: 'center', color: 'var(--muted)', fontSize: '0.85rem' }}>
            {currentMood.text}
          </div>
        </div>

        {/* Action */}
        <button
          className="btn-pastel-blue"
          onClick={handleSubmit}
          style={{ width: '100%', justifyContent: 'center', padding: 14 }}
        >
          Begin Session
          <ArrowRight style={{ width: 16, height: 16 }} />
        </button>
      </div>
    </div>
  );
};

export default SessionEntryModal;
