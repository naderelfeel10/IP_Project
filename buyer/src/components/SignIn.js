import { useState } from 'react';
import API from '../api';
import './Auth.css';

function SignIn({ onSwitchToSignUp }) {
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
            alert('Signed in successfully!');
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <h2>Seller sign in</h2>
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
                    New seller? Create an account
                </p>
            </div>
        </div>
    );
}

export default SignIn;