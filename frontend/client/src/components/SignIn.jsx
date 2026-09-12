import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUser, setUser, setToken, parseJwt } from '../utils/auth';
import { GoogleLogin } from '@react-oauth/google';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import Logo from './Logo';

const SignIn = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const onSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (!form.email || !form.password) return setError('Please enter both email and password');
    let user = getUser();
    if (!user || user.email !== form.email) {
      user = { id: `user_${Date.now()}`, name: form.email.split('@')[0], email: form.email };
    }
    setUser(user);
    navigate('/chat');
  };

  const onGoogleSuccess = async (credentialResponse) => {
    const idToken = credentialResponse?.credential;
    if (!idToken) return;
    setToken(idToken);

    try {
      // Verify token server-side
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const res = await fetch(`${apiUrl}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_token: idToken }),
      });
      if (res.ok) {
        const data = await res.json();
        const user = { id: data.user.id, name: data.user.name, email: data.user.email, picture: data.user.picture };
        setUser(user);
        navigate('/chat');
        return;
      }
    } catch (e) {
      console.warn('Backend token verification unavailable, using local parsing.');
    }

    // Fallback: local JWT parsing
    const payload = parseJwt(idToken) || {};
    const user = { id: payload.sub, name: payload.name || payload.given_name || 'User', email: payload.email };
    setUser(user);
    navigate('/chat');
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <div style={{ textAlign: 'center', marginBottom: 16 }}>
            <Logo onClick={() => navigate('/')} />
          </div>
          <h1>Welcome Back</h1>
          <p className="auth-sub">Sign in to return to your reflection companion</p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={onSubmit}>
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
                placeholder="Enter your password" 
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

          <div className="auth-row">
            <input id="remember" type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
            <label htmlFor="remember" style={{ margin: 0, cursor: 'pointer' }}>Remember me</label>
          </div>

          <button className="auth-primary" type="submit">
            Sign In
          </button>
        </form>

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
          Don't have an account? <span className="auth-link" onClick={() => navigate('/signup')}>Sign up</span>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
