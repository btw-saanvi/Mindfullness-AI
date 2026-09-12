import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus } from 'lucide-react';
import { getToken, getUser } from '../utils/auth';
import Logo from './Logo';

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';

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
        const res = await fetch(`${apiUrl}/history/${userId}`, {
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <button className="back-button light" onClick={() => navigate('/')} title="Home"> 
            <ArrowLeft style={{ width: 18, height: 18 }} />
          </button>
          <Logo size="small" onClick={() => navigate('/')} />
        </div>

        <div className="header-text" style={{ marginLeft: 12 }}>
          <h1 style={{ fontSize: '1.4rem' }}>Session History</h1>
        </div>

        <button className="btn-pastel-blue" onClick={() => navigate('/chat')} style={{ marginLeft: 'auto' }}>
          <Plus style={{ width: 16, height: 16 }} />
          New Session
        </button>
      </div>

      <div className="history-search">
        <input
          type="text"
          placeholder="Search past sessions..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="history-list">
        {loading ? (
          <div style={{ color: 'var(--muted)', textAlign: 'center', padding: 40 }}>Loading history...</div>
        ) : filtered.length === 0 ? (
          <div style={{ color: 'var(--muted)', textAlign: 'center', padding: 40 }}>
            No past sessions found. Start a new session to begin reflecting.
          </div>
        ) : (
          filtered.map((s) => (
            <div key={s.id} className="history-item">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <span className="badge-style" style={{ color: 'var(--accent)', border: '1px solid rgba(26,122,98,0.3)', background: 'var(--accent-soft)' }}>
                  {(s.style || 'Calm').charAt(0).toUpperCase() + (s.style || 'Calm').slice(1)} Mode
                </span>
                <span style={{ color: 'var(--faint)', fontSize: '0.85rem' }}>{s.messages_count || 0} messages</span>
              </div>
              <div className="history-item-meta">
                <span>{s.started_at ? new Date(s.started_at).toLocaleDateString() : 'Recent'}</span>
              </div>
              <div className="history-item-preview">
                {s.preview || 'No preview available.'}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SessionHistory;
