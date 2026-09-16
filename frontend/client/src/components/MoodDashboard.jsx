import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp, Calendar, Heart, Brain, Wind, Plus, Sparkles, RefreshCw, Settings, LogOut } from 'lucide-react';
import axios from 'axios';
import Logo from './Logo';
import { getUser, clearUser } from '../utils/auth';

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const MoodDashboard = ({ onOpenBreathing, onOpenCBT }) => {
  const navigate = useNavigate();
  const user = getUser();
  const initials = (user?.name || 'U').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  const [data, setData] = useState(null);
  const [affirmation, setAffirmation] = useState('');
  const [isAffirmationLoading, setIsAffirmationLoading] = useState(true);

  const fetchAffirmation = async (userId) => {
    setIsAffirmationLoading(true);
    try {
      const res = await axios.get(`${apiUrl}/daily-affirmation/${userId}`);
      if (res.data?.affirmation) setAffirmation(res.data.affirmation);
    } catch {
      setAffirmation('You do not have to carry everything all at once. Taking this moment to breathe is more than enough.');
    } finally {
      setIsAffirmationLoading(false);
    }
  };

  useEffect(() => {
    const userId = localStorage.getItem('mindful_user_id') || 'guest';
    const fetchDash = async () => {
      try {
        const res = await axios.get(`${apiUrl}/dashboard/${userId}`);
        setData(res.data);
      } catch {
        setData({
          streak_days: 4,
          total_sessions: 8,
          pattern_insight: 'Pattern Insight: Your check-ins show steady self-care consistency. Keep nourishing moments of quiet presence.',
          mood_logs: [
            { score: 4, score_label: 'Heavy' },
            { score: 5, score_label: 'Okay' },
            { score: 7, score_label: 'Calm' },
            { score: 6, score_label: 'Calm' },
            { score: 8, score_label: 'Bright' },
          ],
        });
      }
    };
    fetchDash();
    fetchAffirmation(userId);
  }, []);

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button className="back-button light" onClick={() => navigate('/')} title="Home">
            <ArrowLeft style={{ width: 18, height: 18 }} />
          </button>
          <Logo size="small" onClick={() => navigate('/')} />
          <span style={{ marginLeft: 4, color: 'var(--muted)', fontSize: '0.8rem', fontWeight: 500 }}>Dashboard</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button className="btn-pastel-blue" onClick={() => navigate('/chat')}>
            <Plus style={{ width: 16, height: 16 }} />
            New Session
          </button>
          <button
            className="dashboard-profile-btn"
            onClick={() => navigate('/profile')}
            title="Profile & Settings"
          >
            {user?.picture ? (
              <img src={user.picture} alt={user.name} style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }} />
            ) : (
              <div className="dash-avatar-initials">{initials}</div>
            )}
            <Settings style={{ width: 14, height: 14, color: 'var(--muted)' }} />
          </button>
        </div>
      </div>

      <div className="dash-stats-row">
        <div className="dash-stat-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--accent)', marginBottom: 8 }}>
            <Calendar style={{ width: 20, height: 20 }} />
            <span style={{ fontSize: '0.88rem', fontWeight: 500 }}>Self-Care Streak</span>
          </div>
          <div className="dash-stat-number">{data?.streak_days || 1} Days</div>
          <div className="dash-stat-label">Consistent check-ins</div>
        </div>

        <div className="dash-stat-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--accent)', marginBottom: 8 }}>
            <Heart style={{ width: 20, height: 20 }} />
            <span style={{ fontSize: '0.88rem', fontWeight: 500 }}>Completed Sessions</span>
          </div>
          <div className="dash-stat-number">{data?.total_sessions || 0}</div>
          <div className="dash-stat-label">Reflections logged</div>
        </div>

        <div className="dash-stat-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--accent)', marginBottom: 8 }}>
            <TrendingUp style={{ width: 20, height: 20 }} />
            <span style={{ fontSize: '0.88rem', fontWeight: 500 }}>Emotional Trend</span>
          </div>
          <div className="dash-stat-number">Grounding</div>
          <div className="dash-stat-label">Steady awareness</div>
        </div>
      </div>

      <div style={{ padding: '22px 36px 0' }}>
        <div
          style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--line)',
            borderRadius: 16,
            padding: '20px 24px',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 16,
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
            <div
              style={{
                padding: 10,
                background: 'var(--accent-soft)',
                borderRadius: 12,
                color: 'var(--accent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Sparkles style={{ width: 22, height: 22 }} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span style={{ fontWeight: 650, color: 'var(--ink)', fontSize: '0.96rem' }}>
                  Daily Mindful Affirmation
                </span>
                <span
                  style={{
                    fontSize: '0.72rem',
                    background: 'var(--accent-soft)',
                    color: 'var(--accent)',
                    padding: '2px 8px',
                    borderRadius: 12,
                    fontWeight: 600,
                  }}
                >
                  Mood-Aware
                </span>
              </div>
              <p style={{ color: 'var(--ink-soft)', fontSize: '1rem', lineHeight: 1.6, margin: 0, fontStyle: 'italic' }}>
                {isAffirmationLoading ? 'Attuning a gentle reflection for you...' : `"${affirmation}"`}
              </p>
            </div>
          </div>

          <button
            onClick={() => fetchAffirmation(localStorage.getItem('mindful_user_id') || 'guest')}
            disabled={isAffirmationLoading}
            className="btn-outline-warm"
            style={{ padding: 8 }}
            title="Generate a fresh affirmation"
          >
            <RefreshCw style={{ width: 16, height: 16 }} />
          </button>
        </div>
      </div>

      {data?.pattern_insight && (
        <div className="insight-card">
          <div style={{ padding: 8, background: 'var(--accent-soft)', borderRadius: 10, color: 'var(--accent)' }}>
            <Wind style={{ width: 20, height: 20 }} />
          </div>
          <div>
            <div style={{ fontWeight: 650, color: 'var(--ink)', marginBottom: 4 }}>Soft Pattern Insight</div>
            <div style={{ color: 'var(--muted)', fontSize: '0.92rem', lineHeight: 1.6 }}>{data.pattern_insight}</div>
          </div>
        </div>
      )}

      <div style={{ padding: '28px 36px 0' }}>
        <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--line)', borderRadius: 14, padding: 28, boxShadow: 'var(--shadow-sm)' }}>
          <h3 style={{ fontFamily: 'Syne, sans-serif', color: 'var(--ink)', fontSize: '1.2rem', marginBottom: 6 }}>
            Recent Mood Trend
          </h3>
          <p style={{ color: 'var(--muted)', fontSize: '0.88rem', marginBottom: 24 }}>
            1 to 10 mood score across recent check-ins
          </p>

          <div style={{ height: 160, display: 'flex', alignItems: 'flex-end', gap: 20, paddingBottom: 10, borderBottom: '1px dashed var(--line)' }}>
            {(data?.mood_logs || [4, 5, 7, 6, 8]).map((log, idx) => {
              const score = typeof log === 'number' ? log : log.score || 5;
              const heightPct = (score / 10) * 100;
              return (
                <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--accent)', marginBottom: 6, fontWeight: 650 }}>{score}</span>
                  <div
                    style={{
                      width: '100%',
                      maxWidth: 36,
                      height: `${heightPct}%`,
                      background: 'linear-gradient(180deg, var(--accent) 0%, rgba(26,122,98,0.2) 100%)',
                      borderRadius: '6px 6px 0 0',
                    }}
                  />
                  <span style={{ fontSize: '0.75rem', color: 'var(--faint)', marginTop: 8 }}>Day {idx + 1}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div style={{ padding: '28px 36px 0' }}>
        <h3 style={{ fontFamily: 'Syne, sans-serif', color: 'var(--ink)', fontSize: '1.2rem', marginBottom: 16 }}>
          Standalone Therapeutic Exercises
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
          <div className="warm-card" onClick={onOpenBreathing} style={{ cursor: 'pointer' }}>
            <div className="warm-card-icon">
              <Wind style={{ width: 22, height: 22 }} />
            </div>
            <h3>Guided Breathing (4-7-8)</h3>
            <p>Animated timer visualizer to help soothe anxiety and regain calm in minutes.</p>
          </div>

          <div className="warm-card" onClick={onOpenCBT} style={{ cursor: 'pointer' }}>
            <div className="warm-card-icon">
              <Brain style={{ width: 22, height: 22 }} />
            </div>
            <h3>CBT Thought Reframing</h3>
            <p>Structured 3-step worksheet to unpack unhelpful assumptions into balanced thoughts.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MoodDashboard;
