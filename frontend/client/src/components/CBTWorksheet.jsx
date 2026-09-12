import { useState } from 'react';
import { X, Brain, CheckCircle2, ArrowRight } from 'lucide-react';
import axios from 'axios';

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const CBTWorksheet = ({ isOpen, onClose, onComplete }) => {
  const [step, setStep] = useState(1);
  const [automaticThought, setAutomaticThought] = useState('');
  const [evidenceAgainst, setEvidenceAgainst] = useState('');
  const [balancedThought, setBalancedThought] = useState('');
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    setLoading(true);
    const userId = localStorage.getItem('mindful_user_id') || `user_${Date.now()}`;

    try {
      const res = await axios.post(`${apiUrl}/cbt-reframe`, {
        user_id: userId,
        automatic_thought: automaticThought,
        evidence_against: evidenceAgainst,
        balanced_thought: balancedThought
      });
      setAnalysis(res.data.analysis);
      setStep(4);
    } catch (e) {
      setAnalysis("Great effort challenging that thought! Reframing takes practice, and established evidence helps build cognitive resilience.");
      setStep(4);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setStep(1);
    setAutomaticThought('');
    setEvidenceAgainst('');
    setBalancedThought('');
    setAnalysis(null);
    onClose();
  };

  return (
    <div className="breathing-modal-overlay">
      <div className="cbt-modal-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Brain style={{ color: 'var(--accent)', width: 22, height: 22 }} />
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '1.35rem', margin: 0, color: 'var(--ink)' }}>
              CBT Thought Reframing Worksheet
            </h2>
          </div>
          <button onClick={handleReset} style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer' }}>
            <X style={{ width: 20, height: 20 }} />
          </button>
        </div>

        {/* Step Indicator */}
        {step <= 3 && (
          <div className="cbt-step-indicator">
            <div className={`cbt-step-dot ${step >= 1 ? 'active' : ''}`}></div>
            <div className={`cbt-step-dot ${step >= 2 ? 'active' : ''}`}></div>
            <div className={`cbt-step-dot ${step >= 3 ? 'active' : ''}`}></div>
          </div>
        )}

        {step === 1 && (
          <div>
            <label style={{ color: 'var(--ink-soft)', fontSize: '0.95rem', fontWeight: 500, display: 'block' }}>
              Step 1: What is the troubling or automatic thought?
            </label>
            <p style={{ color: 'var(--muted)', fontSize: '0.85rem', margin: '4px 0 10px 0' }}>
              Write out the exact negative thought as it occurred in your mind.
            </p>
            <textarea
              className="cbt-textarea"
              placeholder="e.g., 'I failed this presentation so everyone thinks I am incompetent.'"
              value={automaticThought}
              onChange={(e) => setAutomaticThought(e.target.value)}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                className="btn-pastel-blue"
                disabled={!automaticThought.trim()}
                onClick={() => setStep(2)}
              >
                Next Step
                <ArrowRight style={{ width: 16, height: 16 }} />
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <label style={{ color: 'var(--ink-soft)', fontSize: '0.95rem', fontWeight: 500, display: 'block' }}>
              Step 2: What is the evidence against this thought?
            </label>
            <p style={{ color: 'var(--muted)', fontSize: '0.85rem', margin: '4px 0 10px 0' }}>
              What objective facts or past experiences contradict this negative assumption?
            </p>
            <textarea
              className="cbt-textarea"
              placeholder="e.g., 'My manager complimented my slide design, and I have successfully presented 5 times before.'"
              value={evidenceAgainst}
              onChange={(e) => setEvidenceAgainst(e.target.value)}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <button className="btn-outline-warm" onClick={() => setStep(1)}>
                Back
              </button>
              <button
                className="btn-pastel-blue"
                disabled={!evidenceAgainst.trim()}
                onClick={() => setStep(3)}
              >
                Next Step
                <ArrowRight style={{ width: 16, height: 16 }} />
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <label style={{ color: 'var(--ink-soft)', fontSize: '0.95rem', fontWeight: 500, display: 'block' }}>
              Step 3: What is a more balanced, grounded thought?
            </label>
            <p style={{ color: 'var(--muted)', fontSize: '0.85rem', margin: '4px 0 10px 0' }}>
              Combine the situation and evidence into a realistic, compassionate perspective.
            </p>
            <textarea
              className="cbt-textarea"
              placeholder="e.g., 'I stumbled on one slide, but the overall presentation was informative and I am constantly improving.'"
              value={balancedThought}
              onChange={(e) => setBalancedThought(e.target.value)}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <button className="btn-outline-warm" onClick={() => setStep(2)}>
                Back
              </button>
              <button
                className="btn-pastel-blue"
                disabled={!balancedThought.trim() || loading}
                onClick={handleSubmit}
              >
                {loading ? 'Analyzing...' : 'Complete Reframing'}
              </button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div style={{ textAlign: 'center', padding: '10px 0' }}>
            <CheckCircle2 style={{ width: 44, height: 44, color: 'var(--accent)', margin: '0 auto 12px auto' }} />
            <h3 style={{ fontFamily: 'Syne, sans-serif', color: 'var(--ink)', fontSize: '1.25rem', marginBottom: 12 }}>
              Reframing Completed!
            </h3>
            <div style={{
              background: 'var(--accent-soft)',
              border: '1px solid rgba(26,122,98,0.25)',
              borderRadius: 12,
              padding: 16,
              color: 'var(--ink-soft)',
              fontSize: '0.92rem',
              lineHeight: 1.6,
              textAlign: 'left',
              marginBottom: 20
            }}>
              <div style={{ fontWeight: 600, color: 'var(--accent)', marginBottom: 6 }}>MindfulAI Insight:</div>
              {analysis}
            </div>

            <button className="btn-pastel-blue" onClick={handleReset}>
              Close & Save Reflection
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CBTWorksheet;
