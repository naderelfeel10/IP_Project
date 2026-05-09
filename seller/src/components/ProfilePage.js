import { useEffect, useState } from 'react';
import API from '../api';

function ProfilePage() {
    const [form, setForm] = useState({
        username: '',
        storeName: '',
        phone: '',
        address: ''
    });
    const [pwForm, setPwForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [emailForm, setEmailForm] = useState({
        newEmail: '',
        password: ''
    });
    const [deleteForm, setDeleteForm] = useState({ password: '' });

    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [pwMessage, setPwMessage] = useState('');
    const [pwError, setPwError] = useState('');
    const [emailMessage, setEmailMessage] = useState('');
    const [emailError, setEmailError] = useState('');
    const [deleteError, setDeleteError] = useState('');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const loadProfile = async () => {
        try {
            const res = await API.get('/seller/getProfile');
            setForm({
                username: res.data.seller.username || '',
                storeName: res.data.seller.storeName || '',
                phone: res.data.seller.phone || '',
                address: res.data.seller.address || ''
            });
        } catch (err) {
            setError(err.response?.data?.message || 'cannot load profile');
        }
    };

    useEffect(() => {
        loadProfile();
    }, []);

    const changeInput = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const saveProfile = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        try {
            const res = await API.put('/seller/profile', form);
            localStorage.setItem('sellerUser', JSON.stringify(res.data.seller));
            setMessage('Profile updated successfully.');
        } catch (err) {
            setError(err.response?.data?.message || 'Cannot save profile.');
        }
    };

    const changePassword = async (e) => {
        e.preventDefault();
        setPwMessage('');
        setPwError('');
        if (pwForm.newPassword !== pwForm.confirmPassword) {
            return setPwError('New passwords do not match.');
        }
        if (pwForm.newPassword.length < 6) {
            return setPwError('New password must be at least 6 characters.');
        }
        try {
            await API.patch('/auth/changePassword', {
                currentPassword: pwForm.currentPassword,
                newPassword: pwForm.newPassword
            });
            setPwMessage('Password changed successfully.');
            setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err) {
            setPwError(err.response?.data?.message || 'Cannot change password.');
        }
    };

    const updateEmail = async (e) => {
    e.preventDefault();
    setEmailMessage('');
    setEmailError('');
    try {
        await API.patch('/auth/updateEmail', {
            email: emailForm.newEmail,      // changed from newEmail to email
            password: emailForm.password
        });
        setEmailMessage('Email updated successfully.');
        setEmailForm({ newEmail: '', password: '' });
    } catch (err) {
        setEmailError(err.response?.data?.message || 'Cannot update email.');
    }
};

    const deleteAccount = async (e) => {
        e.preventDefault();
        setDeleteError('');
        try {
            await API.delete('/auth/deleteAccount', {
                data: { password: deleteForm.password }
            });
            localStorage.removeItem('sellerToken');
            localStorage.removeItem('sellerUser');
            window.location.reload();
        } catch (err) {
            setDeleteError(err.response?.data?.message || 'Cannot delete account.');
        }
    };

    const sectionStyle = {
        background: '#fff',
        border: '1px solid #ddd',
        borderRadius: '8px',
        padding: '22px',
        marginBottom: '22px'
    };
    const h3Style = {
        margin: '0 0 16px',
        fontSize: '16px',
        fontWeight: '600',
        borderBottom: '1px solid #eee',
        paddingBottom: '10px'
    };
    const fieldStyle = { marginBottom: '12px', display: 'flex', flexDirection: 'column', gap: '5px' };
    const labelStyle = { fontSize: '13px', color: '#555' };
    const inputStyle = {
        padding: '8px 10px',
        border: '1px solid #ccc',
        borderRadius: '6px',
        fontSize: '14px',
        width: '100%',
        boxSizing: 'border-box'
    };
    const btnStyle = {
        padding: '9px 18px',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '500'
    };
    const msgStyle = { color: 'green', marginBottom: '10px', fontSize: '13px' };
    const errStyle = { color: 'red', marginBottom: '10px', fontSize: '13px' };

    return (
        <div className="section">
            <h2 style={{ marginBottom: '20px' }}>Profile settings</h2>

            {/* ── Profile info ── */}
            <div style={sectionStyle}>
                <h3 style={h3Style}>Account info</h3>
                {message && <p style={msgStyle}>{message}</p>}
                {error && <p style={errStyle}>{error}</p>}
                <form onSubmit={saveProfile}>
                    <div style={fieldStyle}>
                        <label style={labelStyle}>Name</label>
                        <input style={inputStyle} name="username" value={form.username} onChange={changeInput} required />
                    </div>
                    <div style={fieldStyle}>
                        <label style={labelStyle}>Store name</label>
                        <input style={inputStyle} name="storeName" value={form.storeName} onChange={changeInput} />
                    </div>
                    <div style={fieldStyle}>
                        <label style={labelStyle}>Phone</label>
                        <input style={inputStyle} name="phone" value={form.phone} onChange={changeInput} />
                    </div>
                    <div style={fieldStyle}>
                        <label style={labelStyle}>Address</label>
                        <input style={inputStyle} name="address" value={form.address} onChange={changeInput} />
                    </div>
                    <button style={{ ...btnStyle, background: '#222', color: '#fff' }} type="submit">
                        Save profile
                    </button>
                </form>
            </div>

            {/* ── Change password ── */}
            <div style={sectionStyle}>
                <h3 style={h3Style}>Change password</h3>
                {pwMessage && <p style={msgStyle}>{pwMessage}</p>}
                {pwError && <p style={errStyle}>{pwError}</p>}
                <form onSubmit={changePassword}>
                    <div style={fieldStyle}>
                        <label style={labelStyle}>Current password</label>
                        <input
                            style={inputStyle}
                            type="password"
                            value={pwForm.currentPassword}
                            onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })}
                            required
                        />
                    </div>
                    <div style={fieldStyle}>
                        <label style={labelStyle}>New password</label>
                        <input
                            style={inputStyle}
                            type="password"
                            value={pwForm.newPassword}
                            onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })}
                            required
                        />
                    </div>
                    <div style={fieldStyle}>
                        <label style={labelStyle}>Confirm new password</label>
                        <input
                            style={inputStyle}
                            type="password"
                            value={pwForm.confirmPassword}
                            onChange={(e) => setPwForm({ ...pwForm, confirmPassword: e.target.value })}
                            required
                        />
                    </div>
                    <button style={{ ...btnStyle, background: '#1565c0', color: '#fff' }} type="submit">
                        Change password
                    </button>
                </form>
            </div>

            {/* ── Update email ── */}
            <div style={sectionStyle}>
                <h3 style={h3Style}>Update email</h3>
                {emailMessage && <p style={msgStyle}>{emailMessage}</p>}
                {emailError && <p style={errStyle}>{emailError}</p>}
                <form onSubmit={updateEmail}>
                    <div style={fieldStyle}>
                        <label style={labelStyle}>New email address</label>
                        <input
                            style={inputStyle}
                            type="email"
                            value={emailForm.newEmail}
                            onChange={(e) => setEmailForm({ ...emailForm, newEmail: e.target.value })}
                            required
                        />
                    </div>
                    <div style={fieldStyle}>
                        <label style={labelStyle}>Confirm with your password</label>
                        <input
                            style={inputStyle}
                            type="password"
                            value={emailForm.password}
                            onChange={(e) => setEmailForm({ ...emailForm, password: e.target.value })}
                            required
                        />
                    </div>
                    <button style={{ ...btnStyle, background: '#2e7d32', color: '#fff' }} type="submit">
                        Update email
                    </button>
                </form>
            </div>

            {/* ── Delete account ── */}
            <div style={{ ...sectionStyle, borderColor: '#f44336' }}>
                <h3 style={{ ...h3Style, color: '#c62828' }}>Delete account</h3>
                <p style={{ fontSize: '13px', color: '#555', marginBottom: '14px' }}>
                    This is permanent and cannot be undone.
                </p>
                {!showDeleteConfirm ? (
                    <button
                        style={{ ...btnStyle, background: '#c62828', color: '#fff' }}
                        onClick={() => setShowDeleteConfirm(true)}
                    >
                        Delete my account
                    </button>
                ) : (
                    <form onSubmit={deleteAccount}>
                        {deleteError && <p style={errStyle}>{deleteError}</p>}
                        <div style={fieldStyle}>
                            <label style={labelStyle}>Enter your password to confirm</label>
                            <input
                                style={inputStyle}
                                type="password"
                                value={deleteForm.password}
                                onChange={(e) => setDeleteForm({ password: e.target.value })}
                                required
                            />
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button style={{ ...btnStyle, background: '#c62828', color: '#fff' }} type="submit">
                                Confirm delete
                            </button>
                            <button
                                style={{ ...btnStyle, background: '#eee', color: '#333' }}
                                type="button"
                                onClick={() => { setShowDeleteConfirm(false); setDeleteError(''); }}
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}

export default ProfilePage;