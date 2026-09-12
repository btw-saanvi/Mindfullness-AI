import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { setUser, setToken, parseJwt } from '../utils/auth';
import { GoogleLogin } from '@react-oauth/google';
import { User, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import Logo from './Logo';

const SignUp = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const onSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (!form.name || !form.email || !form.password) return setError('All fields are required');
    if (form.password !== form.confirmPassword) return setError('Passwords do not match');
    if (!agreeToTerms) return setError('Please accept the Terms of Service and Privacy Policy');
    const user = { id: `user_${Date.now()}`, name: form.name, email: form.email };
    setUser(user);
    navigate('/chat');
  };

  const onGoogleSuccess = (credentialResponse) => {
    const idToken = credentialResponse?.credential;
    if (!idToken) return;
    setToken(idToken);
    const payload = parseJwt(idToken) || {};
    const user = { id: payload.sub, name: payload.name || payload.given_name || 'User', email: payload.email };
    setUser(user);
    navigate('/chat');
  };

  return (
    <div className="signup-page">
      <div className="signup-container">
        <div className="signup-header">
          <div style={{ textAlign: 'center', marginBottom: 16 }}>
            <Logo onClick={() => navigate('/')} />
          </div>
          <h1>Create Account</h1>
          <p>Begin your gentle mindfulness & reflection journey</p>
        </div>

        <form className="signup-form" onSubmit={onSubmit}>
          {error && <div className="signup-error">{error}</div>}

          <div className="form-group">
            <label>Full Name</label>
            <div className="input-container" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <User className="input-icon" />
              <input 
                name="name" 
                type="text" 
                value={form.name} 
                onChange={onChange} 
                placeholder="Enter your full name" 
              />
            </div>
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <div className="input-container" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Mail className="input-icon" />
              <input 
                name="email" 
                type="email" 
                value={form.email} 
                onChange={onChange} 
                placeholder="you@example.com" 
              />
            </div>
          </div>

          <div className="form-group">
            <label>Password</label>
            <div className="input-container" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Lock className="input-icon" />
              <input 
                name="password" 
                type={showPassword ? "text" : "password"} 
                value={form.password} 
                onChange={onChange} 
                placeholder="Create a password" 
              />
              <button 
                type="button" 
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff style={{ width: 16, height: 16 }} /> : <Eye style={{ width: 16, height: 16 }} />}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label>Confirm Password</label>
            <div className="input-container" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Lock className="input-icon" />
              <input 
                name="confirmPassword" 
                type={showConfirmPassword ? "text" : "password"} 
                value={form.confirmPassword} 
                onChange={onChange} 
                placeholder="Confirm your password" 
              />
              <button 
                type="button" 
                className="password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff style={{ width: 16, height: 16 }} /> : <Eye style={{ width: 16, height: 16 }} />}
              </button>
            </div>
          </div>

          <div className="terms-container" style={{ margin: '12px 0' }}>
            <input 
              id="terms" 
              type="checkbox" 
              checked={agreeToTerms} 
              onChange={(e) => setAgreeToTerms(e.target.checked)} 
            />
            <label htmlFor="terms" style={{ cursor: 'pointer', margin: 0 }}>
              I agree to the <span className="auth-link">Terms of Service</span> and <span className="auth-link">Privacy Policy</span>
            </label>
          </div>

          <button className="create-account-btn" type="submit">
            Create Account
          </button>

          <div className="auth-divider">
            <span>OR</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', margin: '14px 0' }}>
            <GoogleLogin 
              onSuccess={onGoogleSuccess} 
              onError={() => setError('Google Sign-In failed')} 
              useOneTap
              theme="filled_black"
              shape="pill"
            />
          </div>

          <div className="auth-footer">
            Already have an account? <span className="auth-link" onClick={() => navigate('/signin')}>Sign in</span>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignUp;