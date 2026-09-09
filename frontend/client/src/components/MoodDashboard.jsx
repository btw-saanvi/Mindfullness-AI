import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp, Calendar, Heart, Brain, Wind, Plus } from 'lucide-react';
import axios from 'axios';
import Logo from './Logo';

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const MoodDashboard = ({ onOpenBreathing, onOpenCBT }) => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchDash = async () => {
      const userId = localStorage.getItem('mindful_user_id') || 'guest';
      try {
        const res = await axios.get(`${apiUrl}/dashboard/${userId}`);
        setData(res.data);
      } catch (e) {
        setData({
          streak_days: 4,
          total_sessions: 8,
          pattern_insight: "Pattern Insight: Your check-ins show steady self-care consistency. Keep nourishing moments of quiet presence.",
          mood_logs: [
            { score: 4, score_label: 'Heavy' },
            { score: 5, score_label: 'Okay' },
            { score: 7, score_label: 'Calm' },
            { score: 6, score_label: 'Calm' },
            { score: 8, score_label: 'Bright' }
          ]
        });
      }
    };
    fetchDash();
  }, []);

  return (
    <div className="dashboard-page">
      {/* Header */}
      <div className="dashboard-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button className="back-button" onClick={() => navigate('/')} title="Home">
            <ArrowLeft style={{ width: 18, height: 18 }} />
          </button>
          <Logo size="small" onClick={() => navigate('/')} />
        </div>

        <button className="btn-pastel-blue" onClick={() => navigate('/chat')}>
          <Plus style={{ width: 16, height: 16 }} />
          New Reflection Session
        </button>
      </div>

      {/* Stats Summary Row */}
      <div className="dash-stats-row">
        <div className="dash-stat-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#7dd3fc', marginBottom: 8 }}>
            <Calendar style={{ width: 20, height: 20 }} />
            <span style={{ fontSize: '0.88rem', fontWeight: 500 }}>Self-Care Streak</span>
          </div>
          <div className="dash-stat-number">{data?.streak_days || 1} Days</div>
          <div className="dash-stat-label">Consistent check-ins</div>
        </div>

        <div className="dash-stat-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#93c5fd', marginBottom: 8 }}>
            <Heart style={{ width: 20, height: 20 }} />
            <span style={{ fontSize: '0.88rem', fontWeight: 500 }}>Completed Sessions</span>
          </div>
          <div className="dash-stat-number">{data?.total_sessions || 0}</div>
          <div className="dash-stat-label">Reflections logged</div>
        </div>

        <div className="dash-stat-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#bfdbfe', marginBottom: 8 }}>
            <TrendingUp style={{ width: 20, height: 20 }} />
            <span style={{ fontSize: '0.88rem', fontWeight: 500 }}>Emotional Trend</span>
          </div>
          <div className="dash-stat-number">Grounding</div>
          <div className="dash-stat-label">Steady awareness</div>
        </div>
      </div>

      {/* Soft Pattern Insight Card */}
      {data?.pattern_insight && (
        <div className="insight-card" style={{ background: 'rgba(147,197,253,0.1)', border: '1px solid rgba(147,197,253,0.25)' }}>
          <div style={{ padding: 8, background: 'rgba(125,211,252,0.2)', borderRadius: 10, color: '#7dd3fc' }}>
            <Wind style={{ width: 20, height: 20 }} />
          </div>
          <div>
            <div style={{ fontWeight: 600, color: '#f8fafc', marginBottom: 4 }}>Soft Pattern Insight</div>
            <div style={{ color: '#cbd5e1', fontSize: '0.92rem', lineHeight: 1.6 }}>
              {data.pattern_insight}
            </div>
          </div>
        </div>
      )}

      {/* Mood History Chart Area */}
      <div style={{ padding: '30px 40px 0' }}>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 14, padding: 28 }}>
          <h3 style={{ fontFamily: 'Outfit', color: '#f8fafc', fontSize: '1.2rem', marginBottom: 6 }}>
            Recent Mood Trend
          </h3>
          <p style={{ color: '#94a3b8', fontSize: '0.88rem', marginBottom: 24 }}>
            1 to 10 mood score evaluation across recent check-ins
          </p>

          {/* SVG Bar Chart in Pastel Blue */}
          <div style={{ height: 160, display: 'flex', alignItems: 'flex-end', gap: 20, paddingBottom: 10, borderBottom: '1px dashed rgba(255,255,255,0.08)' }}>
            {(data?.mood_logs || [4, 5, 7, 6, 8]).map((log, idx) => {
              const score = typeof log === 'number' ? log : log.score || 5;
              const heightPct = (score / 10) * 100;
              return (
                <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                  <span style={{ fontSize: '0.78rem', color: '#7dd3fc', marginBottom: 6, fontWeight: 600 }}>{score}</span>
                  <div
                    style={{
                      width: '100%',
                      maxWidth: 36,
                      height: `${heightPct}%`,
                      background: 'linear-gradient(180deg, #7dd3fc 0%, rgba(125,211,252,0.2) 100%)',
                      borderRadius: '6px 6px 0 0'
                    }}
                  />
                  <span style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 8 }}>Day {idx + 1}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Quick Tools Section */}
      <div style={{ padding: '30px 40px 0' }}>
        <h3 style={{ fontFamily: 'Outfit', color: '#f8fafc', fontSize: '1.2rem', marginBottom: 16 }}>
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
