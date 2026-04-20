import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

function SignupPage({ onSuccess }) {
  const navigate = useNavigate();
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage({ type: '', text: '' });

    const form = new FormData(event.currentTarget);
    const payload = {
      name: String(form.get('name') || '').trim(),
      email: String(form.get('email') || '').trim(),
      password: String(form.get('password') || ''),
    };

    if (!payload.name || !payload.email || !payload.password.trim()) {
      setMessage({ type: 'danger', text: 'All fields are required.' });
      setIsSubmitting(false);
      return;
    }

    try {
      const { data } = await api.post('/auth/register', payload);
      setMessage({ type: 'success', text: 'Signup successful. Redirecting...' });
      if (typeof onSuccess === 'function') {
        onSuccess(data);
      }
      window.setTimeout(() => navigate(data?.user?.isAdmin ? '/admin' : '/'), 800);
    } catch (error) {
      const errorText = !error.response
        ? 'Server not running. Start backend with: npm --prefix backend start'
        : error.response?.data?.message === 'User already exists'
          ? 'This email is already registered. Please login instead.'
          : error.response?.data?.message || 'Signup failed';

      setMessage({ type: 'danger', text: errorText });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="auth-page">
      <div className="auth-shell">
        <form className="auth-card" onSubmit={handleSubmit}>
          <div className="auth-top-row">
            <Link to="/" className="back-link auth-back-link">Back to Home</Link>
            <span className="tag">StudySathi Signup</span>
          </div>
          <h1>Create Account</h1>
          <p className="muted">Register once and then login from a separate page anytime.</p>

          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input id="name" name="name" type="text" placeholder="Enter your full name" autoComplete="name" required />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" placeholder="Enter your email" autoComplete="email" required />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input id="password" name="password" type="password" placeholder="Create a password" autoComplete="new-password" required />
          </div>

          <button className="btn auth-btn" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Creating account...' : 'Signup'}
          </button>
          {message.text && <p className={message.type}>{message.text}</p>}

          <p className="auth-switch">Already have an account? <Link to="/login">Login here</Link></p>
        </form>
      </div>
    </main>
  );
}

export default SignupPage;
