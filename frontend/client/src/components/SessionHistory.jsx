import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageSquare, Star, TrendingUp, Plus } from 'lucide-react';
import { getToken, getUser } from '../utils/auth';

const API_BASE = 'http://localhost:8000';

const SessionHistory = () => {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  const getUserId = () => {
    const u = getUser();
    if (u?.id) return u.id;
    const existing = localStorage.getItem('mindful_user_id');
    if (existing) return existing;
    const created = `user_${Date.now()}`;
    localStorage.setItem('mindful_user_id', created);
    return created;
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const userId = getUserId();
        const res = await fetch(`${API_BASE}/history/${userId}`, {
          headers: { Authorization: `Bearer ${getToken()}` }
        });
        const data = await res.json();
        setSessions(data.sessions || []);
      } catch (e) {
        console.error('Failed to fetch history', e);
        setSessions([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = sessions.filter(s =>
    s.preview?.toLowerCase().includes(query.toLowerCase()) ||
    s.style?.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="history-page">
      <div className="history-header">
        <button className="back-button" onClick={() => navigate('/')}> 
          <ArrowLeft />
        </button>
        <div className="header-text">
          <h1>Session History</h1>
          <p>Track your therapeutic journey and progress</p>
        </div>
        <button className="new-session" onClick={() => navigate('/chat')}>
          <Plus /> New Session
        </button>
      </div>

      <div className="history-stats">
        <div className="stat-card">
          <MessageSquare />
          <div>
            <div className="stat-number">{sessions.length}</div>
            <div className="stat-label">Total Sessions</div>
          </div>
        </div>
        <div className="stat-card">
          <TrendingUp />
          <div>
            <div className="stat-number">85%</div>
            <div className="stat-label">Positive Outcomes</div>
          </div>
        </div>
        <div className="stat-card">
          <Star />
          <div>
            <div className="stat-number">2</div>
            <div className="stat-label">Favorites</div>
          </div>
        </div>
      </div>

      <div className="history-search">
        <input
          type="text"
          placeholder="Search your sessions..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="history-list">
        {loading ? (
          <div className="history-loading">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="history-empty">No sessions yet. Start a new session to begin your journey.</div>
        ) : (
          filtered.map((s) => (
            <div key={s.id} className="history-item">
              <div className="history-item-header">
                <div className="badge-style">{(s.style || 'Calm').charAt(0).toUpperCase() + (s.style || 'Calm').slice(1)}</div>
                <div className="messages-count">{s.messages_count} messages</div>
              </div>
              <div className="history-item-meta">
                <span className="started">Started: {new Date(s.started_at).toLocaleString()}</span>
                <span className="ended">Ended: {new Date(s.last_updated).toLocaleString()}</span>
              </div>
              <div className="history-item-preview">{s.preview}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SessionHistory;
