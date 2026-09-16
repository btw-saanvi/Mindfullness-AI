import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Mail, Shield, LogOut, Edit3, Save, X, Camera, Bell, Moon, Globe } from 'lucide-react';
import Logo from './Logo';
import { getUser, setUser, clearUser } from '../utils/auth';

const ProfileSettings = () => {
  const navigate = useNavigate();
  const rawUser = getUser();
  const [user, setLocalUser] = useState(rawUser || { name: 'Guest', email: '' });
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: user.name || '', email: user.email || '' });
  const [saved, setSaved] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const [prefs, setPrefs] = useState({
    notifications: true,
    darkMode: false,
    language: 'English',
  });

  const initials = (user.name || 'U')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const handleSave = () => {
    const updated = { ...user, name: form.name, email: form.email };
    setUser(updated);
    setLocalUser(updated);
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleLogout = () => {
    clearUser();
    navigate('/signin');
  };

  return (
    <div className="profile-page">
      {/* Header */}
      <div className="profile-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button className="back-button light" onClick={() => navigate('/dashboard')} title="Back to Dashboard">
            <ArrowLeft style={{ width: 18, height: 18 }} />
          </button>
          <Logo size="small" onClick={() => navigate('/')} />
          <span className="profile-breadcrumb">MindfulAI / Profile & Settings</span>
        </div>
      </div>

      <div className="profile-content">
        {/* Profile Card */}
        <div className="profile-card">
          <div className="profile-avatar-wrap">
            {user.picture ? (
              <img src={user.picture} alt={user.name} className="profile-avatar-img" />
            ) : (
              <div className="profile-avatar-initials">{initials}</div>
            )}
            <button className="avatar-edit-btn" title="Change photo">
              <Camera style={{ width: 14, height: 14 }} />
            </button>
          </div>

          <div className="profile-identity">
            <h2 className="profile-name">{user.name || 'Guest'}</h2>
            <p className="profile-email">{user.email || 'No email set'}</p>
            <span className="profile-badge">MindfulAI Member</span>
          </div>

          {!editing ? (
            <button className="profile-edit-btn" onClick={() => { setEditing(true); setForm({ name: user.name, email: user.email }); }}>
              <Edit3 style={{ width: 15, height: 15 }} />
              Edit Profile
            </button>
          ) : (
            <div className="profile-edit-actions">
              <button className="profile-save-btn" onClick={handleSave}>
                <Save style={{ width: 15, height: 15 }} /> Save
              </button>
              <button className="profile-cancel-btn" onClick={() => setEditing(false)}>
                <X style={{ width: 15, height: 15 }} /> Cancel
              </button>
            </div>
          )}

          {saved && <div className="profile-saved-toast">✓ Profile saved!</div>}
        </div>

        {/* Edit Form */}
        {editing && (
          <div className="settings-section">
            <h3 className="settings-section-title">
              <User style={{ width: 16, height: 16 }} /> Personal Details
            </h3>
            <div className="settings-form">
              <div className="settings-field">
                <label>Display Name</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Your name"
                />
              </div>
              <div className="settings-field">
                <label>Email Address</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder="you@example.com"
                />
              </div>
            </div>
          </div>
        )}

        {/* Personal Details (read mode) */}
        {!editing && (
          <div className="settings-section">
            <h3 className="settings-section-title">
              <User style={{ width: 16, height: 16 }} /> Personal Details
            </h3>
            <div className="settings-info-grid">
              <div className="settings-info-row">
                <span className="info-label"><Mail style={{ width: 14, height: 14 }} /> Email</span>
                <span className="info-value">{user.email || '—'}</span>
              </div>
              <div className="settings-info-row">
                <span className="info-label"><User style={{ width: 14, height: 14 }} /> Name</span>
                <span className="info-value">{user.name || '—'}</span>
              </div>
              <div className="settings-info-row">
                <span className="info-label"><Shield style={{ width: 14, height: 14 }} /> Account ID</span>
                <span className="info-value" style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                  {user.id?.slice(0, 20) || '—'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Preferences */}
        <div className="settings-section">
          <h3 className="settings-section-title">
            <Bell style={{ width: 16, height: 16 }} /> Preferences
          </h3>
          <div className="settings-toggles">
            <div className="settings-toggle-row">
              <div>
                <div className="toggle-label">Daily Check-in Reminder</div>
                <div className="toggle-desc">Get a gentle nudge each morning</div>
              </div>
              <button
                className={`toggle-btn ${prefs.notifications ? 'on' : 'off'}`}
                onClick={() => setPrefs((p) => ({ ...p, notifications: !p.notifications }))}
              >
                <span className="toggle-knob" />
              </button>
            </div>

            <div className="settings-toggle-row">
              <div>
                <div className="toggle-label">
                  <Moon style={{ width: 13, height: 13, display: 'inline', marginRight: 4 }} />
                  Dark Mode
                </div>
                <div className="toggle-desc">Coming soon</div>
              </div>
              <button className="toggle-btn off" disabled>
                <span className="toggle-knob" />
              </button>
            </div>

            <div className="settings-toggle-row">
              <div>
                <div className="toggle-label">
                  <Globe style={{ width: 13, height: 13, display: 'inline', marginRight: 4 }} />
                  Language
                </div>
                <div className="toggle-desc">Response language preference</div>
              </div>
              <select
                className="settings-select"
                value={prefs.language}
                onChange={(e) => setPrefs((p) => ({ ...p, language: e.target.value }))}
              >
                <option>English</option>
                <option>Hinglish</option>
                <option>Hindi</option>
              </select>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="settings-section danger-zone">
          <h3 className="settings-section-title" style={{ color: '#ef4444' }}>
            <LogOut style={{ width: 16, height: 16 }} /> Account
          </h3>
          {!showLogoutConfirm ? (
            <button className="logout-btn" onClick={() => setShowLogoutConfirm(true)}>
              <LogOut style={{ width: 16, height: 16 }} />
              Sign Out
            </button>
          ) : (
            <div className="logout-confirm">
              <p>Are you sure you want to sign out?</p>
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="logout-confirm-yes" onClick={handleLogout}>Yes, Sign Out</button>
                <button className="logout-confirm-no" onClick={() => setShowLogoutConfirm(false)}>Cancel</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;
