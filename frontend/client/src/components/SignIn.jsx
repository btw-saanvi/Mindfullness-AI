import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUser, setUser, setToken, parseJwt } from '../utils/auth';
import { GoogleLogin } from '@react-oauth/google';

const SignIn = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState('');

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const onSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (!form.email || !form.password) return setError('Enter email and password');
    let user = getUser();
    if (!user || user.email !== form.email) {
      user = { id: `user_${Date.now()}`, name: form.email.split('@')[0], email: form.email };
    }
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
    <div className="auth-page">
      <form className="auth-card" onSubmit={onSubmit}>
        <h1>Welcome Back</h1>
        <p className="auth-sub">Sign in to continue your journey to better mental health</p>

        {error && <div className="auth-error">{error}</div>}

        <label>Email</label>
        <input name="email" type="email" value={form.email} onChange={onChange} placeholder="Enter your email" />

        <label>Password</label>
        <input name="password" type="password" value={form.password} onChange={onChange} placeholder="Enter your password" />

        <div className="auth-row">
          <input id="remember" type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
          <label htmlFor="remember"> Remember me</label>
        </div>

        <button className="auth-primary" type="submit">Sign In</button>

        <div style={{ margin: '14px 0', textAlign: 'center', color: 'rgba(255,255,255,0.7)' }}>OR CONTINUE WITH</div>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <GoogleLogin onSuccess={onGoogleSuccess} onError={() => setError('Google Sign-In failed')} useOneTap />
        </div>

        <div className="auth-footer">
          Don't have an account? <span className="auth-link" onClick={() => navigate('/signup')}>Sign up</span>
        </div>
      </form>
    </div>
  );
};

export default SignIn;
