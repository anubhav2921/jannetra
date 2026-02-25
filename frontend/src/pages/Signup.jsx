import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Mail, Lock, User, Building2, KeyRound, ArrowLeft } from 'lucide-react';

const DEPARTMENTS = [
    'Water Supply Department', 'Public Works Department', 'Health Department',
    'Education Department', 'Police Department', 'Municipal Corporation',
    'Transport Department', 'Anti-Corruption Bureau', 'General Administration',
];

export default function Signup({ onLogin }) {
    const [step, setStep] = useState(1); // 1 = form, 2 = OTP
    const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '', department: '' });
    const [otp, setOtp] = useState('');
    const [demoOtp, setDemoOtp] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const update = (field, value) => setForm({ ...form, [field]: value });

    // Step 1: Submit form → get OTP
    const handleSignup = async (e) => {
        e.preventDefault();
        setError('');

        if (form.password !== form.confirm) {
            setError('Passwords do not match');
            return;
        }
        if (form.password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);
        try {
            const res = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: form.name,
                    email: form.email,
                    password: form.password,
                    role: 'LEADER',
                    department: form.department,
                }),
            });
            const data = await res.json();

            if (data.success && data.otp_sent) {
                setDemoOtp(data.demo_otp || '');
                setStep(2);
            } else {
                setError(data.error || 'Signup failed');
            }
        } catch {
            setError('Server unavailable. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Step 2: Verify OTP → create account
    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setError('');

        if (otp.length !== 6) {
            setError('Please enter a 6-digit OTP');
            return;
        }

        setLoading(true);
        try {
            const res = await fetch('/api/auth/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: form.email, otp }),
            });
            const data = await res.json();

            if (data.success) {
                localStorage.setItem('user', JSON.stringify(data.user));
                onLogin(data.user);
                navigate('/');
            } else {
                setError(data.error || 'Verification failed');
            }
        } catch {
            setError('Server unavailable. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-brand">
                    <Shield size={36} style={{ color: '#3b82f6' }} />
                    <h1>Governance Intelligence</h1>
                    <p>Decision Support System</p>
                </div>

                {step === 1 ? (
                    <>
                        <h2 className="auth-title">Create Leader Account</h2>
                        <p className="auth-subtitle">Register to start monitoring governance risks</p>

                        {error && <div className="auth-error">{error}</div>}

                        <form onSubmit={handleSignup} className="auth-form">
                            <div className="auth-field">
                                <User size={16} className="auth-field-icon" />
                                <input type="text" placeholder="Full name" value={form.name}
                                    onChange={(e) => update('name', e.target.value)} required />
                            </div>
                            <div className="auth-field">
                                <Mail size={16} className="auth-field-icon" />
                                <input type="email" placeholder="Email address" value={form.email}
                                    onChange={(e) => update('email', e.target.value)} required />
                            </div>
                            <div className="auth-field">
                                <Building2 size={16} className="auth-field-icon" />
                                <select value={form.department}
                                    onChange={(e) => update('department', e.target.value)} required>
                                    <option value="">Select Department</option>
                                    {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
                                </select>
                            </div>
                            <div className="auth-field">
                                <Lock size={16} className="auth-field-icon" />
                                <input type="password" placeholder="Password (min 6 characters)" value={form.password}
                                    onChange={(e) => update('password', e.target.value)} required />
                            </div>
                            <div className="auth-field">
                                <Lock size={16} className="auth-field-icon" />
                                <input type="password" placeholder="Confirm password" value={form.confirm}
                                    onChange={(e) => update('confirm', e.target.value)} required />
                            </div>
                            <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
                                {loading ? 'Sending OTP...' : 'Send Verification OTP'}
                            </button>
                        </form>
                    </>
                ) : (
                    <>
                        <h2 className="auth-title">Verify Your Email</h2>
                        <p className="auth-subtitle">
                            Enter the 6-digit OTP sent to <strong style={{ color: 'var(--accent-blue)' }}>{form.email}</strong>
                        </p>

                        {/* Demo OTP hint */}
                        {demoOtp && (
                            <div style={{
                                background: 'var(--accent-blue-bg)', border: '1px solid rgba(59,130,246,0.3)',
                                borderRadius: '8px', padding: '10px 14px', marginBottom: '16px', textAlign: 'center',
                            }}>
                                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Demo Mode — Your OTP is: </span>
                                <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--accent-blue)', letterSpacing: '0.2em' }}>
                                    {demoOtp}
                                </span>
                            </div>
                        )}

                        {error && <div className="auth-error">{error}</div>}

                        <form onSubmit={handleVerifyOtp} className="auth-form">
                            <div className="auth-field">
                                <KeyRound size={16} className="auth-field-icon" />
                                <input
                                    type="text"
                                    placeholder="Enter 6-digit OTP"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    maxLength={6}
                                    required
                                    style={{ letterSpacing: '0.3em', fontSize: '1.1rem', fontWeight: 700, textAlign: 'center' }}
                                />
                            </div>
                            <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
                                {loading ? 'Verifying...' : 'Verify & Create Account'}
                            </button>
                            <button type="button" className="btn btn-ghost" style={{ width: '100%' }}
                                onClick={() => { setStep(1); setError(''); setOtp(''); }}>
                                <ArrowLeft size={14} style={{ marginRight: '6px' }} /> Back to Registration
                            </button>
                        </form>
                    </>
                )}

                <p className="auth-footer">
                    Already have an account? <Link to="/login">Sign In</Link>
                </p>
            </div>
        </div>
    );
}
