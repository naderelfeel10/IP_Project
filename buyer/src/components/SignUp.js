import { useState } from 'react';
import { toast } from 'sonner';
import API from '../api';
import './Auth.css';

function SignUp({ onSwitchToSignIn }) {
    const [step, setStep] = useState('signup');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [code, setCode] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    //create account
    const handleSignUp = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await API.post('/auth/createAccount', {
                email, password, username, type: 'buyerAccount'
            });
            setStep('verify'); // move to verification step
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    //verify code
    const handleVerify = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await API.patch('/auth/activateAccount', { email, code });
            setSuccess('Account activated! You can now sign in.');
            setTimeout(() => onSwitchToSignIn(), 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid code');
        } finally {
            setLoading(false);
        }
    };

    // Resend code
    const handleResend = async () => {
        setError('');
        setSuccess('');
        try {
            await API.post('/auth/resendCode', { email });
            setSuccess('New code sent to your email!');
        } catch (err) {
            setError(err.response?.data?.message || 'Could not resend code');
        }
    };

    // ── SIGNUP FORM ──────────────────────────────
    if (step === 'signup') {
        return (
            <div className="auth-page">
                <div className="auth-card">
                    <h2>Create Buyer App account</h2>
                    <form onSubmit={handleSignUp}>
                        {error && <p className="auth-error">{error}</p>}
                        <label className="auth-label">Username</label>
                        <input type="text" placeholder="Your name" required
                            value={username} onChange={(e) => setUsername(e.target.value)} />
                        <label className="auth-label">Email</label>
                        <input type="email" placeholder="you@email.com" required
                            value={email} onChange={(e) => setEmail(e.target.value)} />
                        <label className="auth-label">Password</label>
                        <input type="password" placeholder="Min 8 characters" required
                            value={password} onChange={(e) => setPassword(e.target.value)} />
                        <button type="submit" disabled={loading}>
                            {loading ? 'Creating...' : 'Create account'}
                        </button>
                    </form>
                    <p className="auth-switch" onClick={onSwitchToSignIn}>
                        Already have an account? Sign in
                    </p>
                </div>
            </div>
        );
    }

    // ── VERIFY FORM ──────────────────────────────
    return (
        <div className="auth-page">
            <div className="auth-card">
                <h2>Verify your email</h2>
                <p style={{ textAlign: 'center', color: '#666', marginBottom: '16px' }}>
                    We sent a 6-digit code to <b>{email}</b>
                </p>
                <form onSubmit={handleVerify}>
                    {error && <p className="auth-error">{error}</p>}
                    {success && <p style={{ color: 'green', textAlign: 'center' }}>{success}</p>}
                    <label className="auth-label">Verification code</label>
                    <input type="text" placeholder="123456" required
                        maxLength={6}
                        value={code} onChange={(e) => setCode(e.target.value)} />
                    <button type="submit" disabled={loading}>
                        {loading ? 'Verifying...' : 'Verify account'}
                    </button>
                </form>
                <p className="auth-switch" onClick={handleResend}>
                    Didn't receive the code? Resend
                </p>
            </div>
        </div>
    );
}

export default SignUp;