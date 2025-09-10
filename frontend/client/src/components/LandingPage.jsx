import { useNavigate } from 'react-router-dom';
import { MessageCircle, Heart, Brain, Lightbulb, ArrowRight, Star } from 'lucide-react';
import { isLoggedIn } from '../utils/auth';
const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const LandingPage = ({ userPreferences, setUserPreferences }) => {
  const navigate = useNavigate();

  const handleStartTalking = () => {
    if (isLoggedIn()) {
      navigate('/chat');
    } else {
      navigate('/signin');
    }
  };

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">MindfulAI</h1>
          <p className="hero-tagline">Your pocket-sized therapist, always here to listen.</p>
          <p className="hero-description">
            Experience compassionate AI therapy that adapts to your needs, available 24/7 in a safe, judgment-free space.
          </p>
          <div className="hero-cta-row">
            <button className="cta-button" onClick={handleStartTalking}>
              <MessageCircle className="button-icon" />
              Start Talking
            </button>
            <button className="cta-button outline" onClick={() => navigate('/signin')}>
              Sign In
            </button>
          </div>
          <p className="hero-subtext">Completely private + Available 24/7</p>
        </div>
      </section>

      {/* Journey to Wellness Section */}
      <section className="journey-section">
        <div className="container">
          <h2 className="section-title">Your Journey to Wellness</h2>
          <p className="section-subtitle">Simple steps to start your personalized therapy experience</p>
          
          <div className="steps-container">
            <div className="step">
              <div className="step-icon">1</div>
              <h3>Choose Your Style</h3>
              <p>Select from four therapeutic approaches: Calm conversations, Motivational support, CBT techniques, or Mindfulness practices.</p>
            </div>
            <div className="step">
              <div className="step-icon step-2">2</div>
              <h3>Start Talking</h3>
              <p>Share your thoughts and feelings in a safe, private space. Our AI responds with empathy and professional guidance.</p>
            </div>
            <div className="step">
              <div className="step-icon">3</div>
              <h3>Track Progress</h3>
              <p>Monitor your emotional journey, review past sessions, and celebrate your growth with detailed insights.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section">
        <div className="container">
          <h2 className="section-title testimonials-title">Transforming Lives Daily</h2>
          <p className="section-subtitle">Real stories from people who found peace and clarity through MindfulAI</p>
          
          <div className="testimonials-container">
            <div className="testimonial-card">
              <div className="avatar">S</div>
              <div className="user-info">
                <h4>Sarah M.</h4>
                <p>Marketing Manager</p>
              </div>
              <p className="testimonial-text">"MindfulAI has been a game-changer for my anxiety. The AI therapist is incredibly understanding and provides practical coping strategies."</p>
              <div className="rating">
                <Star className="star" />
                <Star className="star" />
                <Star className="star" />
                <Star className="star" />
                <Star className="star" />
              </div>
            </div>
            
            <div className="testimonial-card">
              <div className="avatar">M</div>
              <div className="user-info">
                <h4>Michael R.</h4>
                <p>Software Engineer</p>
              </div>
              <p className="testimonial-text">"The CBT techniques helped me reframe negative thoughts. I feel more confident and in control of my emotions now."</p>
              <div className="rating">
                <Star className="star" />
                <Star className="star" />
                <Star className="star" />
                <Star className="star" />
                <Star className="star" />
              </div>
            </div>
            
            <div className="testimonial-card">
              <div className="avatar">E</div>
              <div className="user-info">
                <h4>Emma L.</h4>
                <p>Student</p>
              </div>
              <p className="testimonial-text">"Having 24/7 access to therapy has been incredible. The mindfulness practices have transformed my daily routine."</p>
              <div className="rating">
                <Star className="star" />
                <Star className="star" />
                <Star className="star" />
                <Star className="star" />
                <Star className="star" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-container">
            <div className="stat">
              <div className="stat-number">10K+</div>
              <div className="stat-label">Active Users</div>
            </div>
            <div className="stat">
              <div className="stat-number">95%</div>
              <div className="stat-label">Satisfaction Rate</div>
            </div>
            <div className="stat">
              <div className="stat-number">24/7</div>
              <div className="stat-label">Availability</div>
            </div>
            <div className="stat">
              <div className="stat-number">100K+</div>
              <div className="stat-label">Sessions Completed</div>
            </div>
          </div>
        </div>
      </section>

      {/* Why MindfulAI Section */}
      <section className="why-section">
        <div className="container">
          <h2 className="section-title">Why MindfulAI?</h2>
          <p className="section-subtitle">Combining cutting-edge AI with evidence-based therapeutic approaches for personalized mental health support</p>
          
          <div className="why-content">
            <div className="features-column">
              <div className="feature">
                <div className="feature-icon">
                  <Heart className="icon" />
                </div>
                <h3>Judgment-Free Space</h3>
                <p>Express yourself freely in a completely safe and confidential environment where you can be your authentic self.</p>
              </div>
              
              <div className="feature">
                <div className="feature-icon">
                  <Brain className="icon" />
                </div>
                <h3>Evidence-Based Approaches</h3>
                <p>Our AI is trained on proven therapeutic methods including CBT, mindfulness, and motivational interviewing techniques.</p>
              </div>
              
              <div className="feature">
                <div className="feature-icon">
                  <Lightbulb className="icon" />
                </div>
                <h3>Personalized Experience</h3>
                <p>Every conversation is tailored to your unique needs, learning from your preferences and adapting to your communication style.</p>
              </div>
            </div>
            
            <div className="cta-column">
              <div className="cta-card">
                <h3>Start Your Free Session</h3>
                <ul className="benefits-list">
                  <li>No credit card required</li>
                  <li>Complete privacy protection</li>
                  <li>Unlimited conversation time</li>
                  <li>All therapy styles included</li>
                </ul>
                <button className="cta-button secondary" onClick={handleStartTalking}>
                  Begin Your Journey
                  <ArrowRight className="button-icon" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Healing Through Technology Section */}
      <section className="technology-section">
        <div className="container">
          <h2 className="section-title">Healing Through Technology</h2>
          <p className="section-subtitle">Advanced AI therapy techniques designed to support your mental wellness journey</p>
          
          <div className="tech-cards">
            <div className="tech-card">
              <div className="tech-icon">🧠</div>
              <h3>Calm Conversations</h3>
              <p>Gentle, empathetic dialogue designed to help you process emotions and find inner peace through compassionate communication.</p>
            </div>
            
            <div className="tech-card">
              <div className="tech-icon">📝</div>
              <h3>Progress Tracking</h3>
              <p>Monitor your emotional journey with detailed insights, mood patterns, and personalized recommendations for continued growth.</p>
            </div>
            
            <div className="tech-card">
              <div className="tech-icon">💗</div>
              <h3>Mindful Support</h3>
              <p>24/7 availability with instant responses, ensuring you always have a supportive presence during challenging moments.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-brand">
              <h3>MindfulAI</h3>
              <p>Compassionate AI therapy for a healthier mind</p>
            </div>
            
            <div className="footer-links">
              <button onClick={handleStartTalking}>Start Session</button>
              <button onClick={() => navigate('/history')}>View History</button>
            </div>
            
            <div className="social-links">
              <div className="social-icon">📷</div>
              <div className="social-icon">🐦</div>
              <div className="social-icon">💼</div>
            </div>
          </div>
          
          <div className="footer-bottom">
            <p>Designed for mental wellness and Always having someone to talk to.....</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
