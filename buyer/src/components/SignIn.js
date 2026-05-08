import { useState } from 'react';
import { toast } from 'sonner';
import API from '../api';
import { saveAuthToken } from '../auth';
import './Auth.css';

function SignIn({ onSignedIn, onSwitchToSignUp }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await API.post('/auth/signin', { email, password });
            console.log(res.data);
            if (res.data.user && res.data.user.type !== 'buyerAccount') {
                setError('This page is for buyers only');
                toast.error('This page is for buyers only');
                return;
            }
            saveAuthToken(res.data.token);
            toast.success('Signed in successfully');
            onSignedIn();
        } catch (err) {
            const message = err.response?.data?.message || 'Something went wrong';
            setError(message);
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <h2>Buyer App sign in</h2>
                {error && <p className="auth-error">{error}</p>}
                <label className="auth-label">Email</label>
                <input type="email" placeholder="you@email.com" required
                    value={email} onChange={(e) => setEmail(e.target.value)} />
                <label className="auth-label">Password</label>
                <input type="password" placeholder="Password" required
                    value={password} onChange={(e) => setPassword(e.target.value)} />
                <button type="submit" disabled={loading} onClick={handleSubmit}>
                    {loading ? 'Signing in...' : 'Sign in'}
                </button>
                <p className="auth-switch" onClick={onSwitchToSignUp}>
                    New to Buyer App? Create an account
                </p>
            </div>
        </div>
    );
}

export default SignIn;
