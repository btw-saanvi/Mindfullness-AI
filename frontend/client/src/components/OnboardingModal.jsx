import { useState } from 'react';
import { ShieldCheck, ArrowRight, Heart, MessageSquare, Brain, Wind, Target } from 'lucide-react';
import axios from 'axios';
import Logo from './Logo';

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const OnboardingModal = ({ isOpen, onClose, onComplete }) => {
  const [step, setStep] = useState(1);
  const [primaryGoal, setPrimaryGoal] = useState('vent');
  const [vibe, setVibe] = useState('chill');
  const [biggestStressor, setBiggestStressor] = useState('');
  const [acknowledged, setAcknowledged] = useState(false);

  if (!isOpen) return null;

  const handleNext = async () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      if (!acknowledged) return;
      
      const userId = localStorage.getItem('mindful_user_id') || `user_${Date.now()}`;
      localStorage.setItem('mindful_user_id', userId);
      
      const preferences = {
        user_id: userId,
        primary_goal: primaryGoal,
        vibe: vibe,
        biggest_stressor: biggestStressor
      };
      
      localStorage.setItem('mindful_user_preferences', JSON.stringify(preferences));

      try {
        await axios.post(`${apiUrl}/onboarding`, preferences);
      } catch (_e) {
        console.warn('Backend onboarding sync offline, saved locally');
      }

      onComplete(preferences);
      onClose();
    }
  };

  return (
    <div className="breathing-modal-overlay">
      <div className="cbt-modal-card" style={{ maxWidth: 500 }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <Logo size="medium" />
        </div>

        {/* Step dots */}
        <div className="cbt-step-indicator">
          <div className={`cbt-step-dot ${step >= 1 ? 'active' : ''}`}></div>
          <div className={`cbt-step-dot ${step >= 2 ? 'active' : ''}`}></div>
          <div className={`cbt-step-dot ${step >= 3 ? 'active' : ''}`}></div>
        </div>

        {step === 1 && (
          <div>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '1.4rem', color: 'var(--ink)', marginBottom: 6 }}>
              Welcome to MindfulAI
            </h2>
            <p style={{ color: 'var(--muted)', fontSize: '0.92rem', marginBottom: 20 }}>
              Let's tailor your reflection experience. What brings you here today?
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { id: 'vent', icon: MessageSquare, label: 'A quiet space to vent freely' },
                { id: 'reframe', icon: Brain, label: 'Reframe negative or anxious thoughts' },
                { id: 'calm', icon: Wind, label: 'Calm down & practice breathing' },
                { id: 'intention', icon: Target, label: 'Set daily mindful intentions' }
              ].map(item => {
                const Icon = item.icon;
                const isSel = primaryGoal === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setPrimaryGoal(item.id)}
                    style={{
                      padding: 14,
                      borderRadius: 12,
                      border: isSel ? '1px solid var(--accent)' : '1px solid var(--line)',
                      background: isSel ? 'var(--accent-soft)' : 'var(--bg)',
                      color: 'var(--ink)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      textAlign: 'left',
                      cursor: 'pointer',
                      fontSize: '0.92rem'
                    }}
                  >
                    <Icon style={{ width: 18, height: 18, color: isSel ? 'var(--accent)' : 'var(--muted)' }} />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '1.4rem', color: 'var(--ink)', marginBottom: 6 }}>Companion Tone Vibe</h2>
            <p style={{ color: 'var(--muted)', fontSize: '0.92rem', marginBottom: 20 }}>
              How would you like MindfulAI to respond during your reflection sessions?
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
              {[
                { id: 'chill', name: 'Chill & Gentle', desc: 'Soft, comforting listening without pressure.' },
                { id: 'grounded', name: 'Grounded & Direct', desc: 'Steady focus on CBT techniques & action.' },
                { id: 'hype', name: 'Encouraging & Uplifting', desc: 'Warm, positive energy to build confidence.' }
              ].map(item => {
                const isSel = vibe === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setVibe(item.id)}
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
                    <div style={{ fontWeight: 600, fontSize: '0.95rem', color: isSel ? 'var(--accent)' : 'var(--ink)' }}>{item.name}</div>
                    <div style={{ color: 'var(--muted)', fontSize: '0.85rem', marginTop: 2 }}>{item.desc}</div>
                  </button>
                );
              })}
            </div>

            <label style={{ color: 'var(--ink-soft)', fontSize: '0.88rem', display: 'block', marginBottom: 6 }}>
              Current main stressor (optional):
            </label>
            <input
              type="text"
              placeholder="e.g. Work deadline, exams, sleep..."
              value={biggestStressor}
              onChange={(e) => setBiggestStressor(e.target.value)}
              style={{
                width: '100%',
                padding: 12,
                borderRadius: 10,
                border: '1px solid var(--line)',
                background: 'var(--bg)',
                color: 'var(--ink)'
              }}
            />
          </div>
        )}

        {step === 3 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, color: 'var(--accent)' }}>
              <ShieldCheck style={{ width: 24, height: 24 }} />
              <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '1.4rem', margin: 0, color: 'var(--ink)' }}>Safety & Boundaries</h2>
            </div>

            <div style={{
              background: 'var(--accent-soft)',
              border: '1px solid rgba(26,122,98,0.25)',
              borderRadius: 12,
              padding: 16,
              color: 'var(--ink-soft)',
              fontSize: '0.9rem',
              lineHeight: 1.6,
              marginBottom: 20
            }}>
              <p style={{ margin: '0 0 8px 0', fontWeight: 600, color: 'var(--accent)' }}>Important Boundary Notice:</p>
              <p style={{ margin: '0 0 8px 0' }}>
                MindfulAI is an AI reflection companion designed for daily emotional check-ins, CBT reframing exercises, and stress relief.
              </p>
              <p style={{ margin: 0 }}>
                <strong>It is not a replacement for licensed clinical therapy or emergency care.</strong> Immediate crisis hotlines (988, Crisis Text Line) are built directly into the system.
              </p>
            </div>

            <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer', color: 'var(--ink)', fontSize: '0.9rem' }}>
              <input
                type="checkbox"
                checked={acknowledged}
                onChange={(e) => setAcknowledged(e.target.checked)}
                style={{ accentColor: 'var(--accent)', marginTop: 3 }}
              />
              <span>I understand that MindfulAI is a reflection companion and not a licensed therapy service.</span>
            </label>
          </div>
        )}

        {/* Footer Actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 28 }}>
          {step > 1 ? (
            <button className="btn-outline-warm" onClick={() => setStep(step - 1)}>
              Back
            </button>
          ) : <div></div>}

          <button
            className="btn-pastel-blue"
            onClick={handleNext}
            disabled={step === 3 && !acknowledged}
            style={{ opacity: (step === 3 && !acknowledged) ? 0.5 : 1 }}
          >
            {step === 3 ? 'Start Reflecting' : 'Continue'}
            <ArrowRight style={{ width: 16, height: 16 }} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingModal;
