import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState('request');
  const [formData, setFormData] = useState({
    email: '',
    code: '',
    password: '',
    confirmPassword: '',
  });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    setFormData((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleRequestCode = async (event) => {
    event.preventDefault();
    setMessage({ type: '', text: '' });

    if (!formData.email.trim()) {
      setMessage({ type: 'danger', text: 'Registered email is required.' });
      return;
    }

    setIsSubmitting(true);

    try {
      const { data } = await api.post('/auth/forgot-password/request-code', {
        email: formData.email.trim(),
      });
      if (data?.success === false) {
        setMessage({ type: 'danger', text: data.message || 'Unable to send reset code right now.' });
        return;
      }

      setMessage({ type: 'success', text: data.message || 'Verification code sent to your email.' });
      setStep('reset');
    } catch (error) {
      const errorText = !error.response
        ? 'Server not running. Start backend with: npm --prefix backend start'
        : error.response?.data?.message || 'Unable to send reset code';

      setMessage({ type: 'danger', text: errorText });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async (event) => {
    event.preventDefault();
    setMessage({ type: '', text: '' });

    if (!formData.email.trim() || !formData.code.trim() || !formData.password || !formData.confirmPassword) {
      setMessage({ type: 'danger', text: 'All fields are required.' });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setMessage({ type: 'danger', text: 'New password and confirm password must match.' });
      return;
    }

    setIsSubmitting(true);

    try {
      const { data } = await api.post('/auth/forgot-password/reset', {
        email: formData.email.trim(),
        code: formData.code.trim(),
        password: formData.password,
      });
      setMessage({ type: 'success', text: data.message || 'Password reset successful. Redirecting to login...' });
      setTimeout(() => navigate('/login'), 1200);
    } catch (error) {
      const errorText = !error.response
        ? 'Server not running. Start backend with: npm --prefix backend start'
        : error.response?.data?.message || 'Password reset failed';

      setMessage({ type: 'danger', text: errorText });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="auth-page">
      <div className="auth-shell">
        <form className="auth-card" onSubmit={step === 'request' ? handleRequestCode : handleResetPassword}>
          <div className="auth-top-row">
            <Link to="/" className="back-link auth-back-link">Back to Home</Link>
            <span className="tag">StudySathi Reset</span>
          </div>
          <h1>Forgot Password</h1>
          <p className="muted">
            {step === 'request'
              ? 'Enter your registered email to receive a verification code.'
              : 'Enter the code sent to your email and choose a new password.'}
          </p>

          <div className="form-group">
            <label htmlFor="forgot-email">Email</label>
            <input
              id="forgot-email"
              name="email"
              type="email"
              placeholder="Enter your registered email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          {step === 'reset' ? (
            <>
              <div className="form-group">
                <label htmlFor="forgot-code">Verification Code</label>
                <input
                  id="forgot-code"
                  name="code"
                  type="text"
                  inputMode="numeric"
                  maxLength="6"
                  placeholder="Enter the 6-digit code"
                  value={formData.code}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="forgot-password">New Password</label>
                <input
                  id="forgot-password"
                  name="password"
                  type="password"
                  placeholder="Enter your new password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="forgot-confirm-password">Confirm Password</label>
                <input
                  id="forgot-confirm-password"
                  name="confirmPassword"
                  type="password"
                  placeholder="Confirm your new password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>
            </>
          ) : null}

          <button className="btn auth-btn" type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? step === 'request' ? 'Sending code...' : 'Resetting...'
              : step === 'request' ? 'Send Code' : 'Reset Password'}
          </button>
          {message.text && <p className={message.type}>{message.text}</p>}

          {step === 'reset' ? (
            <p className="auth-switch">Need a new code? <button className="auth-link-btn" type="button" onClick={() => setStep('request')}>Resend code</button></p>
          ) : null}
          <p className="auth-switch">Remembered it? <Link to="/login">Back to login</Link></p>
        </form>
      </div>
    </main>
  );
}

export default ForgotPasswordPage;
