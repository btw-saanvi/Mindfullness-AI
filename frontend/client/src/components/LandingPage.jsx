import { useNavigate } from 'react-router-dom';
import { MessageSquare, Brain, Wind, Sun, ShieldCheck, ArrowRight, PhoneCall, Check } from 'lucide-react';
import { isLoggedIn } from '../utils/auth';
import Logo from './Logo';
import heroArt from '../assets/mindful-hero-pixel.png';

const LandingPage = () => {
  const navigate = useNavigate();

  const handleStartTalking = () => {
    if (isLoggedIn()) navigate('/chat');
    else navigate('/signin');
  };

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const modes = [
    'Vent', 'Reframe', 'Calm', 'Intention', 'CBT', 'Breath',
    'Ground', 'Journal', 'Mood', 'Streak', 'History', 'Companion',
  ];

  return (
    <div className="landing-page">
      <section className="hero-scene" style={{ backgroundImage: `url(${heroArt})` }}>
        <nav className="main-nav scene-nav">
          <div className="container nav-container">
            <Logo variant="sky" onClick={() => navigate('/')} />
            <ul className="nav-pills">
              <li className="nav-pill" onClick={() => scrollToSection('tools')}>Tools</li>
              <li className="nav-pill" onClick={() => scrollToSection('flow')}>Flow</li>
              <li className="nav-pill" onClick={() => scrollToSection('safety')}>Safety</li>
              <li className="nav-pill" onClick={() => navigate(isLoggedIn() ? '/dashboard' : '/signin')}>
                {isLoggedIn() ? 'Dashboard' : 'Sign in'}
              </li>
              <li className="nav-pill nav-pill-solid" onClick={handleStartTalking}>Begin session</li>
            </ul>
          </div>
        </nav>

        <div className="hero-scene-inner">
          <div className="hero-copy">
            <h1 className="hero-title">MindfulAI lets you sit with your thoughts — gently</h1>
            <p className="hero-description">
              Start with a check-in, then hand breathing, CBT reframing, and mood tracking to your companion while you stay in control.
            </p>
            <div className="hero-cta-row">
              <button className="btn-hero-solid" onClick={handleStartTalking}>
                <MessageSquare style={{ width: 16, height: 16 }} />
                Begin session
              </button>
              <button className="btn-hero-ghost" onClick={() => scrollToSection('flow')}>
                See how it works
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="band-dark" id="tools">
        <div className="container">
          <div className="os-intro">
            <h2 className="display-title">MindfulAI is a reflection operating system designed to help you stay with what’s here</h2>
            <p className="os-lead">
              Bring your mood, stressors, and preferred vibe into one companion. Tools, sessions, and takeaways stay aligned to the same story.
            </p>
          </div>

          <div className="os-split">
            <ul className="principle-list">
              <li>
                <strong>Structured tools</strong>
                <span>CBT worksheets, 4-7-8 breathing, and 5-4-3-2-1 grounding sit beside chat — not buried in a menu.</span>
              </li>
              <li>
                <strong>Human in the loop</strong>
                <span>You pick the need, tone, and when to end. Nothing is clinical, and crisis cues always surface real help.</span>
              </li>
              <li>
                <strong>Shared context</strong>
                <span>Mood logs, streaks, and session summaries remember the arc without diagnosing you.</span>
              </li>
            </ul>

            <div className="product-window">
              <div className="product-chrome">
                <span className="product-dot" />
                <span className="product-dot" />
                <span className="product-dot" />
                <span className="product-chrome-label">MindfulAI / Companion</span>
              </div>
              <div className="product-body">
                <aside className="product-sidebar">
                  <div className="product-nav-item active">Companion</div>
                  <div className="product-nav-item">Breathing</div>
                  <div className="product-nav-item">CBT Reframe</div>
                  <div className="product-nav-item">Mood</div>
                </aside>
                <div className="product-main">
                  <div className="product-bubble ai">Welcome back. What feels heaviest right now?</div>
                  <div className="product-bubble user">I keep looping on a work mistake from yesterday.</div>
                  <div className="product-bubble ai">Let’s slow that loop. Vent first, or open a CBT worksheet together.</div>
                  <div className="product-status">
                    <div className="listening-orb active" />
                    Listening · Calm vibe
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="band-cream" id="flow">
        <div className="container">
          <div className="section-header wide">
            <div className="section-kicker">What MindfulAI does</div>
            <h2 className="display-title dark">Keep living your day. Put MindfulAI to work on the hard feelings.</h2>
            <p className="section-subtitle">
              Start with the outcome you need. The same companion context keeps conversation, breath, and thought work together.
            </p>
          </div>

          <article className="stage-row">
            <div className="stage-copy">
              <div className="stage-num">1.0 — Enter</div>
              <h3>Pick your need, then check in</h3>
              <p>Vent, reframe, calm down, or set an intention. Log a 1–10 mood score before the session starts so the companion meets you where you are.</p>
              <ul className="mini-chips">
                <li>1.1 Need picker</li>
                <li>1.2 Mood slider</li>
                <li>1.3 Tone vibe</li>
                <li>1.4 Style</li>
              </ul>
            </div>
            <div className="stage-panel">
              <div className="need-grid">
                {['Vent thoughts', 'Reframe thought', 'Calm down', 'Set intention'].map((label, i) => (
                  <div key={label} className={`need-tile ${i === 0 ? 'active' : ''}`}>
                    <span>0{i + 1}</span>
                    {label}
                  </div>
                ))}
              </div>
              <div className="mood-row">
                <span>Mood check-in</span>
                <strong>6 / 10 · okay</strong>
              </div>
            </div>
          </article>

          <article className="stage-row reverse">
            <div className="stage-copy">
              <div className="stage-num">2.0 — Reflect</div>
              <h3>A listening companion, not a lecture</h3>
              <p>Write in a journal-like space with a live orb, Chill / Grounded / Uplifting vibes, and Calm, Motivational, CBT, or Mindfulness styles.</p>
              <ul className="mini-chips">
                <li>2.1 Companion chat</li>
                <li>2.2 Breathing overlay</li>
                <li>2.3 CBT worksheet</li>
                <li>2.4 Crisis interrupt</li>
              </ul>
            </div>
            <div className="stage-panel dark">
              <div className="mini-chat">
                <div className="product-bubble ai">I hear the loop. Want to stay with the feeling, or reframe the thought?</div>
                <div className="product-bubble user">Stay with it for a minute.</div>
                <div className="product-status"><div className="listening-orb active" /> Reflecting…</div>
              </div>
            </div>
          </article>

          <article className="stage-row">
            <div className="stage-copy">
              <div className="stage-num">3.0 — Close</div>
              <h3>Leave with one takeaway</h3>
              <p>End the session to generate a recap card: what you talked about, plus one gentle action. Mood trends and streaks live on the dashboard.</p>
              <ul className="mini-chips">
                <li>3.1 Summary card</li>
                <li>3.2 Mood trend</li>
                <li>3.3 Streak</li>
                <li>3.4 Affirmation</li>
              </ul>
            </div>
            <div className="stage-panel">
              <div className="stat-trio">
                <div><em>Streak</em><b>4 days</b><span>+1</span></div>
                <div><em>Sessions</em><b>8</b><span>+2</span></div>
                <div><em>Trend</em><b>Grounding</b><span>steady</span></div>
              </div>
              <p className="takeaway">Takeaway: Practice one slow exhale before you reopen the loop.</p>
            </div>
          </article>
        </div>
      </section>

      <section className="band-dark" id="chapters">
        <div className="container">
          <div className="section-header wide">
            <div className="section-kicker light">Learn the tools</div>
            <h2 className="display-title">Four rooms in the same house</h2>
            <p className="os-lead">Read the intention, then let MindfulAI turn it into a session, worksheet, or dashboard view.</p>
          </div>
          <div className="chapter-grid">
            {[
              { ch: 'Chapter I', title: 'How to vent', action: handleStartTalking },
              { ch: 'Chapter II', title: 'How to reframe', action: handleStartTalking },
              { ch: 'Chapter III', title: 'How to breathe', action: handleStartTalking },
              { ch: 'Chapter IV', title: 'How to track mood', action: () => navigate('/dashboard') },
            ].map((c) => (
              <button key={c.title} className="chapter-card" onClick={c.action} type="button">
                <span>{c.ch}</span>
                <strong>{c.title}</strong>
                <em>by MindfulAI</em>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="band-cream" id="modes">
        <div className="container">
          <div className="section-header wide">
            <div className="section-kicker">All the tools and systems</div>
            <h2 className="display-title dark">You stay in control. Nothing ships as therapy.</h2>
          </div>
          <div className="mode-keys">
            {modes.map((m) => (
              <button key={m} type="button" className="mode-key" onClick={handleStartTalking}>{m}</button>
            ))}
          </div>
        </div>
      </section>

      <section className="band-dark" id="safety">
        <div className="container">
          <div className="safety-os">
            <ShieldCheck style={{ width: 28, height: 28 }} />
            <h2 className="display-title">Safety stays in the loop</h2>
            <p>
              MindfulAI is a reflection companion — not licensed care. Crisis language pauses the chat and shows 988, Crisis Text Line, AASRA, and findahelpline.com.
            </p>
            <button className="btn-hero-solid" onClick={handleStartTalking}>
              Begin session
              <ArrowRight style={{ width: 16, height: 16 }} />
            </button>
          </div>
        </div>
      </section>

      <footer className="footer-os">
        <div className="container">
          <div className="footer-cta">
            <h2 className="display-title">Run a reflection session with AI</h2>
            <p>MindfulAI is a companion OS for emotional check-ins, CBT reframes, and daily self-care.</p>
            <button className="btn-hero-solid" onClick={handleStartTalking}>Begin session</button>
          </div>
          <div className="footer-grid">
            <div className="footer-col-brand">
              <Logo showText variant="dark" />
              <p>Built for personal reflection. Not a replacement for clinical therapy.</p>
            </div>
            <div>
              <div className="footer-col-title">Tools</div>
              <ul className="footer-col-links">
                <li onClick={handleStartTalking}>Need picker</li>
                <li onClick={() => navigate('/chat')}>CBT reframe</li>
                <li onClick={() => navigate('/chat')}>4-7-8 breathing</li>
                <li onClick={() => navigate('/dashboard')}>Mood dashboard</li>
              </ul>
            </div>
            <div>
              <div className="footer-col-title">Navigate</div>
              <ul className="footer-col-links">
                <li onClick={() => scrollToSection('flow')}>Session flow</li>
                <li onClick={() => navigate('/history')}>History</li>
                <li onClick={() => navigate('/signin')}>Sign in</li>
                <li onClick={() => navigate('/signup')}>Create account</li>
              </ul>
            </div>
            <div>
              <div className="footer-col-title">Crisis</div>
              <div className="footer-crisis-box">
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, fontWeight: 600, color: '#fca5a5' }}>
                  <PhoneCall style={{ width: 16, height: 16 }} /> 24/7
                </div>
                <strong>988</strong> Call/Text (US/CA)
                <div style={{ marginTop: 6 }}><strong>Crisis Text:</strong> HOME to 741741</div>
                <div style={{ marginTop: 6 }}><strong>AASRA:</strong> +91-9820466726</div>
              </div>
            </div>
          </div>
          <div className="footer-bottom-bar">
            <div>© {new Date().getFullYear()} MindfulAI</div>
            <div className="footer-bottom-links">
              <span onClick={() => scrollToSection('safety')}>Safety</span>
              <span onClick={() => navigate('/')}>Privacy</span>
              <span onClick={() => navigate('/')}>Terms</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
