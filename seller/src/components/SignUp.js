import { useState } from 'react';
import API from '../api';
import './Auth.css';

function SignUp({ onSwitchToSignIn }) {
    const [username, setUsername] = useState('');
    const [storeName, setStoreName] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
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
                email,
                password,
                username,
                storeName,
                phone,
                address,
                type: 'sellerAccount'
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
                <form onSubmit={handleSubmit}>
                    {error && <p className="auth-error">{error}</p>}
                    <label className="auth-label">Username</label>
                    <input type="text" placeholder="Your name" required
                        value={username} onChange={(e) => setUsername(e.target.value)} />
                    <label className="auth-label">Store name</label>
                    <input type="text" placeholder="My store" required
                        value={storeName} onChange={(e) => setStoreName(e.target.value)} />
                    <label className="auth-label">Phone</label>
                    <input type="text" placeholder="Phone number"
                        value={phone} onChange={(e) => setPhone(e.target.value)} />
                    <label className="auth-label">Address</label>
                    <input type="text" placeholder="Store address"
                        value={address} onChange={(e) => setAddress(e.target.value)} />
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

export default SignUp;
