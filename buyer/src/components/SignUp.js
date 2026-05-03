import { useState } from 'react';
import API from '../api';
import './Auth.css';

function SignUp({ onSwitchToSignIn }) {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await API.post('/auth/createAccount', {
                email, password, username, type: 'sellerAccount'
            });
            alert('Account created! Please sign in.');
            onSwitchToSignIn();
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <h2>Create account</h2>
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
                <button type="submit" disabled={loading} onClick={handleSubmit}>
                    {loading ? 'Creating...' : 'Create account'}
                </button>
                <p className="auth-switch" onClick={onSwitchToSignIn}>
                    Already have an account? Sign in
                </p>
            </div>
        </div>
    );
}

export default SignUp;