import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import Modal from '../components/Modal';
import {
  Lock, User, ArrowRight, Shield, Sparkles, KeyRound, CheckCircle2, AlertCircle,
  Eye, EyeOff, Send, Check, ShieldCheck, Mail
} from 'lucide-react';

export default function LoginPage({ setActivePage, setActiveTab }) {
  const { login, showToast } = useAuth();
  const [userIdOrEmail, setUserIdOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showMainPassword, setShowMainPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Forgot Password Modal State
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [resetStep, setResetStep] = useState(1); // 1: Enter Identifier, 2: Enter OTP, 3: New Password, 4: Success
  const [resetIdentifier, setResetIdentifier] = useState('');
  const [resolvedUserId, setResolvedUserId] = useState('');
  const [maskedEmail, setMaskedEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpPreview, setOtpPreview] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState('');
  const [resetSuccessMsg, setResetSuccessMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const loggedUser = await login(userIdOrEmail, password, rememberMe);
      if (loggedUser.role === 'Student') {
        setActiveTab('dashboard');
      } else {
        setActiveTab('admin-dashboard');
      }
      setActivePage('dashboard');
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };



  const handleOpenForgotModal = () => {
    setResetStep(1);
    setResetIdentifier(userIdOrEmail || '');
    setResolvedUserId('');
    setMaskedEmail('');
    setOtpCode('');
    setOtpPreview('');
    setNewPassword('');
    setConfirmPassword('');
    setResetError('');
    setResetSuccessMsg('');
    setForgotModalOpen(true);
  };

  // STEP 1: Verify Account & Request OTP Code
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setResetError('');

    if (!resetIdentifier.trim()) {
      setResetError('Please enter your User ID, Email, or Register Number.');
      return;
    }

    setResetLoading(true);

    try {
      let res;
      try {
        res = await api.post('/auth/forgot-password/request', { identifier: resetIdentifier });
      } catch (err) {
        // Fallback to legacy endpoint if multi-step endpoint route is loading
        res = await api.post('/auth/forgot-password', { email: resetIdentifier, userId: resetIdentifier });
      }

      if (res.success) {
        setResolvedUserId(res.user_id || resetIdentifier);
        setMaskedEmail(res.maskedEmail || res.email || '');
        setOtpPreview(res.otpPreview || '');
        setResetSuccessMsg(res.message || 'Verification OTP code generated.');
        setResetStep(2);
      }
    } catch (err) {
      setResetError(err.message || 'No registered account found matching that User ID, Email, or Register Number.');
    } finally {
      setResetLoading(false);
    }
  };

  // STEP 2: Verify OTP Code
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setResetError('');

    if (!otpCode || otpCode.trim().length !== 6) {
      setResetError('Please enter the 6-digit OTP code sent to your account.');
      return;
    }

    setResetLoading(true);

    try {
      try {
        const res = await api.post('/auth/forgot-password/verify', {
          identifier: resolvedUserId || resetIdentifier,
          otp: otpCode.trim()
        });
        if (res.success) {
          setResetSuccessMsg(res.message || 'OTP verified successfully!');
          setResetStep(3);
        }
      } catch (err) {
        // Fallback verification check
        if (otpPreview && otpCode.trim() === otpPreview.trim()) {
          setResetSuccessMsg('OTP verified successfully!');
          setResetStep(3);
        } else {
          throw err;
        }
      }
    } catch (err) {
      setResetError(err.message || 'Invalid OTP code. Please check and try again.');
    } finally {
      setResetLoading(false);
    }
  };

  // STEP 3: Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setResetError('');

    if (newPassword.length < 6) {
      setResetError('New password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setResetError('Passwords do not match. Please re-enter identical passwords.');
      return;
    }

    setResetLoading(true);

    try {
      let res;
      try {
        res = await api.post('/auth/forgot-password/reset', {
          identifier: resolvedUserId || resetIdentifier,
          otp: otpCode.trim(),
          newPassword
        });
      } catch (err) {
        res = await api.post('/auth/forgot-password', {
          email: resetIdentifier,
          userId: resolvedUserId || resetIdentifier,
          otp: otpCode.trim(),
          newPassword
        });
      }

      if (res.success) {
        showToast(res.message || 'Password reset successfully!', 'success');
        setResetStep(4);
        setUserIdOrEmail(resolvedUserId || resetIdentifier);
        setPassword(newPassword);
      }
    } catch (err) {
      setResetError(err.message || 'Failed to reset password.');
    } finally {
      setResetLoading(false);
    }
  };

  // Calculate password strength rating
  const getPasswordStrength = (pass) => {
    if (!pass) return { score: 0, text: '', color: '#e2e8f0' };
    if (pass.length < 6) return { score: 1, text: 'Too Weak (min 6 chars)', color: '#ef4444' };
    let score = 2;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    if (score <= 2) return { score: 2, text: 'Moderate', color: '#f59e0b' };
    if (score === 3) return { score: 3, text: 'Good', color: '#3b82f6' };
    return { score: 4, text: 'Strong Security', color: '#10b981' };
  };

  const strength = getPasswordStrength(newPassword);

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div
        className="card"
        style={{
          maxWidth: '480px',
          width: '100%',
          padding: '2.5rem',
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
          borderRadius: '1.25rem'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              margin: '0 auto 1rem auto',
              background: '#eff6ff',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#1d4ed8'
            }}
          >
            <Shield size={32} />
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a' }}>Portal Access Login</h2>
          <p style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.25rem' }}>
            National Service Scheme Management Portal
          </p>
        </div>

        {error && (
          <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '0.75rem', borderRadius: '0.5rem', fontSize: '0.85rem', marginBottom: '1.25rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>User ID, Email, or Register Number</label>
            <div style={{ position: 'relative' }}>
              <User size={18} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="text"
                className="form-control"
                style={{ paddingLeft: '2.5rem' }}
                placeholder="e.g. NSS2026IT001, 722123104031, or email"
                value={userIdOrEmail}
                onChange={(e) => setUserIdOrEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type={showMainPassword ? 'text' : 'password'}
                className="form-control"
                style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowMainPassword(!showMainPassword)}
                style={{ position: 'absolute', right: '0.85rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 0 }}
              >
                {showMainPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />
              <span>Remember Me</span>
            </label>
            <button type="button" onClick={handleOpenForgotModal} style={{ color: '#2563eb', fontWeight: 700, border: 'none', background: 'none', cursor: 'pointer' }}>
              Forgot Password?
            </button>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.85rem', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }} disabled={loading}>
            {loading ? 'Authenticating...' : 'Sign In to Portal'}
            <ArrowRight size={18} />
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem', color: '#64748b' }}>
          Not an NSS Volunteer yet?{' '}
          <button onClick={() => setActivePage('register')} style={{ color: '#2563eb', fontWeight: 700, border: 'none', background: 'none', cursor: 'pointer' }}>
            Register Now
          </button>
        </div>
      </div>

      {/* ENHANCED MULTI-STEP FORGOT PASSWORD MODAL */}
      <Modal isOpen={forgotModalOpen} onClose={() => setForgotModalOpen(false)} title="Account Password Recovery & Reset">
        {/* Step Indicator Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', background: '#f8fafc', padding: '0.75rem 1rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: resetStep >= 1 ? '#1d4ed8' : '#94a3b8', fontWeight: resetStep === 1 ? 800 : 600, fontSize: '0.8rem' }}>
            <span style={{ width: '22px', height: '22px', borderRadius: '50%', background: resetStep >= 1 ? '#1d4ed8' : '#cbd5e1', color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem' }}>1</span>
            Account
          </div>
          <div style={{ height: '2px', flex: 1, background: resetStep >= 2 ? '#1d4ed8' : '#e2e8f0', margin: '0 0.5rem' }}></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: resetStep >= 2 ? '#1d4ed8' : '#94a3b8', fontWeight: resetStep === 2 ? 800 : 600, fontSize: '0.8rem' }}>
            <span style={{ width: '22px', height: '22px', borderRadius: '50%', background: resetStep >= 2 ? '#1d4ed8' : '#cbd5e1', color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem' }}>2</span>
            OTP Verification
          </div>
          <div style={{ height: '2px', flex: 1, background: resetStep >= 3 ? '#1d4ed8' : '#e2e8f0', margin: '0 0.5rem' }}></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: resetStep >= 3 ? '#1d4ed8' : '#94a3b8', fontWeight: resetStep >= 3 ? 800 : 600, fontSize: '0.8rem' }}>
            <span style={{ width: '22px', height: '22px', borderRadius: '50%', background: resetStep >= 3 ? '#1d4ed8' : '#cbd5e1', color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem' }}>3</span>
            New Password
          </div>
        </div>

        {/* STEP 1: ACCOUNT IDENTIFIER LOOKUP */}
        {resetStep === 1 && (
          <form onSubmit={handleRequestOtp}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', background: '#eff6ff', padding: '0.85rem', borderRadius: '0.65rem', marginBottom: '1.25rem', border: '1px solid #bfdbfe' }}>
              <KeyRound size={22} style={{ color: '#1d4ed8', flexShrink: 0, marginTop: '2px' }} />
              <p style={{ fontSize: '0.85rem', color: '#1e40af', margin: 0, lineHeight: 1.45 }}>
                Enter your registered <strong>User ID</strong> (e.g. NSS2026IT001), <strong>College Register Number</strong> (e.g. 722123104031), or <strong>Email address</strong> to send a password reset OTP.
              </p>
            </div>

            {resetError && (
              <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '0.65rem 0.85rem', borderRadius: '0.5rem', fontSize: '0.85rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertCircle size={16} />
                <span>{resetError}</span>
              </div>
            )}

            <div className="form-group">
              <label style={{ fontWeight: 700 }}>User ID, Email, or Register Number *</label>
              <div style={{ position: 'relative' }}>
                <User size={18} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input
                  type="text"
                  className="form-control"
                  style={{ paddingLeft: '2.5rem' }}
                  placeholder="e.g. NSS2026IT001, 722123104031, or student@college.edu"
                  value={resetIdentifier}
                  onChange={(e) => setResetIdentifier(e.target.value)}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1.5rem' }}>
              <button type="button" className="btn btn-outline" onClick={() => setForgotModalOpen(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }} disabled={resetLoading}>
                {resetLoading ? 'Verifying Account...' : 'Verify & Send OTP'}
                <Send size={16} />
              </button>
            </div>
          </form>
        )}

        {/* STEP 2: ENTER OTP CODE */}
        {resetStep === 2 && (
          <form onSubmit={handleVerifyOtp}>
            <div style={{ background: '#f0fdf4', color: '#15803d', padding: '0.75rem 0.85rem', borderRadius: '0.5rem', fontSize: '0.85rem', marginBottom: '1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle2 size={18} />
              <span>Account found for <strong>{resolvedUserId}</strong> ({maskedEmail})</span>
            </div>

            {/* OTP Preview & Direct Fill Chip */}
            {otpPreview && (
              <div style={{ background: '#fef3c7', border: '1px solid #fde68a', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1.25rem' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#b45309', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', justifyBetween: 'space-between' }}>
                  <span>🔐 Verification OTP Code Generated:</span>
                  <span style={{ fontSize: '1rem', letterSpacing: '2px', fontWeight: 900, color: '#78350f', background: '#fef08a', padding: '0.1rem 0.5rem', borderRadius: '0.25rem', marginLeft: 'auto' }}>
                    {otpPreview}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setOtpCode(otpPreview)}
                  style={{ background: '#d97706', color: '#fff', border: 'none', padding: '0.25rem 0.6rem', borderRadius: '0.25rem', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.25rem' }}
                >
                  <Sparkles size={12} /> Auto-fill Code {otpPreview}
                </button>
              </div>
            )}

            {resetError && (
              <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '0.65rem 0.85rem', borderRadius: '0.5rem', fontSize: '0.85rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertCircle size={16} />
                <span>{resetError}</span>
              </div>
            )}

            <div className="form-group">
              <label style={{ fontWeight: 700 }}>Enter 6-Digit OTP Code *</label>
              <input
                type="text"
                className="form-control"
                style={{ fontSize: '1.25rem', letterSpacing: '4px', textAlign: 'center', fontWeight: 800 }}
                placeholder="123456"
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                required
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem' }}>
              <button type="button" className="btn btn-outline" onClick={() => setResetStep(1)}>
                Back
              </button>
              <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }} disabled={resetLoading}>
                {resetLoading ? 'Verifying OTP...' : 'Verify OTP Code'}
                <ShieldCheck size={16} />
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: ENTER NEW PASSWORD */}
        {resetStep === 3 && (
          <form onSubmit={handleResetPassword}>
            <div style={{ background: '#eff6ff', color: '#1d4ed8', padding: '0.75rem', borderRadius: '0.5rem', fontSize: '0.85rem', marginBottom: '1.25rem', fontWeight: 600 }}>
              OTP Verified! Create a new secure password for account <strong>{resolvedUserId}</strong>.
            </div>

            {resetError && (
              <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '0.65rem 0.85rem', borderRadius: '0.5rem', fontSize: '0.85rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertCircle size={16} />
                <span>{resetError}</span>
              </div>
            )}

            <div className="form-group">
              <label style={{ fontWeight: 700 }}>New Password (min 6 characters) *</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  className="form-control"
                  style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  style={{ position: 'absolute', right: '0.85rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 0 }}
                >
                  {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {/* Password Strength Bar */}
              {newPassword && (
                <div style={{ marginTop: '0.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.2rem', color: strength.color }}>
                    <span>Password Strength:</span>
                    <span>{strength.text}</span>
                  </div>
                  <div style={{ height: '4px', background: '#e2e8f0', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${(strength.score / 4) * 100}%`, background: strength.color, transition: 'width 0.3s' }}></div>
                  </div>
                </div>
              )}
            </div>

            <div className="form-group">
              <label style={{ fontWeight: 700 }}>Confirm New Password *</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  className="form-control"
                  style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{ position: 'absolute', right: '0.85rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 0 }}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem' }}>
              <button type="button" className="btn btn-outline" onClick={() => setResetStep(2)}>
                Back
              </button>
              <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }} disabled={resetLoading}>
                {resetLoading ? 'Resetting Password...' : 'Save New Password'}
                <Check size={16} />
              </button>
            </div>
          </form>
        )}

        {/* STEP 4: SUCCESS CONFIRMATION */}
        {resetStep === 4 && (
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem auto' }}>
              <CheckCircle2 size={40} />
            </div>
            <h4 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
              Password Reset Complete!
            </h4>
            <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '1.5rem', lineHeight: 1.5 }}>
              Your password for account <strong>{userIdOrEmail}</strong> has been updated successfully in the system. The login form below is autofilled with your updated credentials.
            </p>
            <button
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.85rem', fontSize: '1rem', fontWeight: 700 }}
              onClick={() => setForgotModalOpen(false)}
            >
              Sign In to Portal Now
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
}
