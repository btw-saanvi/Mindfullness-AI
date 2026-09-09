import { useNavigate } from 'react-router-dom';
import { MessageSquare, Brain, Wind, Compass, Sun, Lock, ShieldCheck, Clock, ArrowRight, PhoneCall } from 'lucide-react';
import { isLoggedIn } from '../utils/auth';
import Logo from './Logo';

const LandingPage = () => {
  const navigate = useNavigate();

  const handleStartTalking = () => {
    if (isLoggedIn()) {
      navigate('/chat');
    } else {
      navigate('/signin');
    }
  };

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="landing-page">
      {/* Navigation Header */}
      <nav className="main-nav">
        <div className="container nav-container">
          <Logo onClick={() => navigate('/')} />

          <ul className="nav-links">
            <li className="nav-link-item" onClick={() => scrollToSection('tools')}>Therapeutic Tools</li>
            <li className="nav-link-item" onClick={() => scrollToSection('flow')}>Session Flow</li>
            <li className="nav-link-item" onClick={() => scrollToSection('safety')}>Safety & Boundaries</li>
          </ul>

          <div className="nav-actions">
            {isLoggedIn() ? (
              <>
                <button className="btn-outline-warm" onClick={() => navigate('/dashboard')}>
                  Dashboard
                </button>
                <button className="btn-pastel-blue" onClick={() => navigate('/chat')}>
                  Open Companion
                </button>
              </>
            ) : (
              <>
                <button className="btn-outline-warm" onClick={() => navigate('/signin')}>
                  Sign In
                </button>
                <button className="btn-pastel-blue" onClick={handleStartTalking}>
                  Begin Session
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section (Original Hero Background Preserved) */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="disclaimer-pill">
            <Wind style={{ width: 14, height: 14 }} />
            <span>Mental Wellness & Reflection Companion</span>
          </div>

          <h1 className="hero-title">MindfulAI</h1>
          <p className="hero-tagline">A safe, judgment-free space to talk, reflect, and grow.</p>
          <p className="hero-description">
            Experience structured reflection tools, CBT thought reframing worksheets, guided 4-7-8 breathing exercises, 
            and compassionate conversation whenever you need clarity.
          </p>

          <div className="hero-cta-row">
            <button className="btn-pastel-blue" onClick={handleStartTalking} style={{ padding: '14px 32px', fontSize: '1.02rem' }}>
              <MessageSquare style={{ width: 18, height: 18 }} />
              Start Reflection Session
            </button>
            {isLoggedIn() && (
              <button className="btn-outline-warm" onClick={() => navigate('/dashboard')} style={{ padding: '14px 28px', fontSize: '1.02rem' }}>
                View Mood Dashboard
              </button>
            )}
          </div>

          <div className="hero-trust-row">
            <span><Lock style={{ width: 14, height: 14 }} /> 100% Confidential</span>
            <span className="hero-trust-dot">•</span>
            <span><Clock style={{ width: 14, height: 14 }} /> Available 24/7</span>
            <span className="hero-trust-dot">•</span>
            <span><ShieldCheck style={{ width: 14, height: 14 }} /> Non-Clinical Companion</span>
          </div>
        </div>
      </section>

      {/* Interactive Tools Section */}
      <section id="tools">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Tangible Reflection Tools</h2>
            <p className="section-subtitle">Structured tools built around established wellness techniques</p>
          </div>

          <div className="warm-grid">
            <div className="warm-card">
              <div className="warm-card-icon">
                <Brain style={{ width: 22, height: 22 }} />
              </div>
              <h3>CBT Thought Reframing</h3>
              <p>Unpack unhelpful automatic assumptions by identifying counter-evidence and establishing balanced perspectives.</p>
            </div>

            <div className="warm-card">
              <div className="warm-card-icon">
                <Wind style={{ width: 22, height: 22 }} />
              </div>
              <h3>Guided 4-7-8 Breathing</h3>
              <p>Animated rhythm visualizer designed to help soothe an activated nervous system and restore calm presence.</p>
            </div>

            <div className="warm-card">
              <div className="warm-card-icon">
                <Sun style={{ width: 22, height: 22 }} />
              </div>
              <h3>Mood & Streak Dashboard</h3>
              <p>Log mood entries per session and view gentle pattern insights into your recurring stressors over time.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Structured Session Flow */}
      <section id="flow" style={{ background: 'rgba(15,23,42,0.4)' }}>
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Structured Session Flow</h2>
            <p className="section-subtitle">More than just open-ended chat—guided reflection from start to finish</p>
          </div>

          <div className="warm-grid">
            <div className="warm-card">
              <div style={{ color: '#7dd3fc', fontWeight: 600, fontSize: '0.88rem', marginBottom: 8 }}>STEP 01</div>
              <h3>Pick Your Need</h3>
              <p>Select your entry focus and log your current mood score before starting.</p>
            </div>

            <div className="warm-card">
              <div style={{ color: '#7dd3fc', fontWeight: 600, fontSize: '0.88rem', marginBottom: 8 }}>STEP 02</div>
              <h3>Animated Listening Companion</h3>
              <p>Write in a comfortable journal-like environment with an animated listening companion orb.</p>
            </div>

            <div className="warm-card">
              <div style={{ color: '#7dd3fc', fontWeight: 600, fontSize: '0.88rem', marginBottom: 8 }}>STEP 03</div>
              <h3>Takeaway Summary Card</h3>
              <p>Conclude your session with a generated recap card highlighting core themes and 1 takeaway.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Safety & Boundaries */}
      <section id="safety">
        <div className="container">
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 20,
            padding: 40,
            maxWidth: 800,
            margin: '0 auto',
            textAlign: 'center'
          }}>
            <ShieldCheck style={{ width: 36, height: 36, color: '#7dd3fc', margin: '0 auto 16px auto' }} />
            <h2 className="section-title" style={{ fontSize: '1.8rem' }}>Safety & Non-Clinical Boundaries</h2>
            <p style={{ color: '#94a3b8', fontSize: '0.98rem', lineHeight: 1.7, marginBottom: 20 }}>
              MindfulAI is designed responsibly as an educational & reflective wellness companion. 
              It does not diagnose medical conditions, prescribe medication, or replace licensed psychological care. 
              Immediate 24/7 crisis hotlines (988, Crisis Text Line) are built directly into the system.
            </p>
            <button className="btn-pastel-blue" onClick={handleStartTalking}>
              Begin Mindful Session
              <ArrowRight style={{ width: 16, height: 16 }} />
            </button>
          </div>
        </div>
      </section>

      {/* Improved 4-Column Footer */}
      <footer className="footer-modern">
        <div className="container">
          <div className="footer-grid">
            {/* Column 1: Brand */}
            <div className="footer-col-brand">
              <Logo showText={true} />
              <p>
                A quiet, compassionate space for emotional reflection, CBT thought reframing, and daily mental wellness support.
              </p>
              <div style={{ display: 'flex', gap: 12, color: '#7dd3fc', fontSize: '0.85rem' }}>
                <span>🔒 Confidential</span>
                <span>•</span>
                <span>🌿 Non-Clinical</span>
              </div>
            </div>

            {/* Column 2: Therapeutic Tools */}
            <div>
              <div className="footer-col-title">Reflection Tools</div>
              <ul className="footer-col-links">
                <li onClick={handleStartTalking}>Structured Need Picker</li>
                <li onClick={() => navigate('/chat')}>CBT Thought Reframing</li>
                <li onClick={() => navigate('/chat')}>Guided 4-7-8 Breathing</li>
                <li onClick={() => navigate('/chat')}>5-4-3-2-1 Grounding Guide</li>
                <li onClick={() => navigate('/dashboard')}>Mood & Streak Tracker</li>
              </ul>
            </div>

            {/* Column 3: Navigation */}
            <div>
              <div className="footer-col-title">Navigation</div>
              <ul className="footer-col-links">
                <li onClick={handleStartTalking}>Begin Session</li>
                <li onClick={() => navigate('/dashboard')}>Wellness Dashboard</li>
                <li onClick={() => navigate('/history')}>Session History</li>
                <li onClick={() => navigate('/signin')}>Sign In to Account</li>
                <li onClick={() => navigate('/signup')}>Create New Account</li>
              </ul>
            </div>

            {/* Column 4: Emergency Hotlines */}
            <div>
              <div className="footer-col-title">Crisis & Safety Hotlines</div>
              <div className="footer-crisis-box">
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, fontWeight: 600, color: '#fca5a5' }}>
                  <PhoneCall style={{ width: 16, height: 16 }} />
                  Immediate Support (24/7)
                </div>
                <strong>988 Suicide & Crisis Lifeline:</strong> Call/Text 988 (US/CA)
                <div style={{ marginTop: 6 }}><strong>Crisis Text Line:</strong> Text HOME to 741741</div>
                <div style={{ marginTop: 6 }}><strong>AASRA Helpline (India):</strong> +91-9820466726</div>
                <div style={{ marginTop: 6 }}><strong>Global Directory:</strong> findahelpline.com</div>
              </div>
            </div>
          </div>

          {/* Footer Bottom Bar */}
          <div className="footer-bottom-bar">
            <div>© {new Date().getFullYear()} MindfulAI. Built for personal reflection and emotional self-care.</div>
            <div className="footer-bottom-links">
              <span onClick={() => scrollToSection('safety')}>Safety Ethics</span>
              <span>•</span>
              <span onClick={() => navigate('/')}>Privacy Policy</span>
              <span>•</span>
              <span onClick={() => navigate('/')}>Terms of Service</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
