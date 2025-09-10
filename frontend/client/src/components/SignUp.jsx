import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { setUser } from '../utils/auth';
import { User, Mail, Lock, Eye, EyeOff } from 'lucide-react';

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
    if (!agreeToTerms) return setError('Please agree to the Terms of Service and Privacy Policy');
    const user = { id: `user_${Date.now()}`, name: form.name, email: form.email };
    setUser(user);
    navigate('/chat');
  };

  return (
    <div className="signup-page">
      <div className="signup-container">
        {/* Logo */}
        <div className="signup-logo">
          <div className="logo-icon">
            <div className="logo-inner"></div>
            <div className="logo-ring"></div>
            <div className="logo-gradient"></div>
          </div>
        </div>

        {/* Header */}
        <div className="signup-header">
          <h1>Join Us Today</h1>
          <p>Start your mental wellness journey with personalized AI therapy.</p>
        </div>

        {/* Form */}
        <form className="signup-form" onSubmit={onSubmit}>
          {error && <div className="signup-error">{error}</div>}

          {/* Full Name */}
          <div className="form-group">
            <label>Full Name</label>
            <div className="input-container">
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

          {/* Email */}
          <div className="form-group">
            <label>Email</label>
            <div className="input-container">
              <Mail className="input-icon" />
              <input 
                name="email" 
                type="email" 
                value={form.email} 
                onChange={onChange} 
                placeholder="Enter your email" 
              />
            </div>
          </div>

          {/* Password */}
          <div className="form-group">
            <label>Password</label>
            <div className="input-container">
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
                {showPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="form-group">
            <label>Confirm Password</label>
            <div className="input-container">
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
                {showConfirmPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>
          </div>

          {/* Terms Checkbox */}
          <div className="terms-container">
            <input 
              id="terms" 
              type="checkbox" 
              checked={agreeToTerms} 
              onChange={(e) => setAgreeToTerms(e.target.checked)} 
            />
            <label htmlFor="terms">
              I agree to the <span className="terms-link">Terms of Service</span> and <span className="terms-link">Privacy Policy</span>
            </label>
          </div>

          {/* Create Account Button */}
          <button className="create-account-btn" type="submit">
            Create Account
          </button>

          {/* Divider */}
          <div className="divider">
            <span>OR SIGN UP WITH</span>
          </div>

          {/* Social Buttons */}
          <div className="social-buttons">
            <button type="button" className="social-btn google-btn">
              <div className="social-icon">G</div>
              Google
            </button>
            <button type="button" className="social-btn twitter-btn">
              <div className="social-icon twitter-icon">🐦</div>
              Twitter
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignUp;