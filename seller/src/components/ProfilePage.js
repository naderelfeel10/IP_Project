import { useEffect, useState } from 'react';
import API from '../api';

function ProfilePage() {
    const [form, setForm] = useState({
        username: '',
        storeName: '',
        phone: '',
        address: ''
    });
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

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

    const changeInput = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const saveProfile = async (e) => {
        e.preventDefault();

        try {
            const res = await API.put('/seller/profile', form);
            localStorage.setItem('sellerUser', JSON.stringify(res.data.seller));
            setMessage('profile updated');
        } catch (err) {
            setError(err.response?.data?.message || 'cannot save profile');
        }
    };

    return (
        <div className="section">
            <h2>Seller profile</h2>
            {message && <p className="message">{message}</p>}
            {error && <p className="error">{error}</p>}

            <form onSubmit={saveProfile} className="form-grid">
                <div>
                    <label>Name</label>
                    <input name="username" value={form.username} onChange={changeInput} required />
                </div>
                <div>
                    <label>Store name</label>
                    <input name="storeName" value={form.storeName} onChange={changeInput} required />
                </div>
                <div>
                    <label>Phone</label>
                    <input name="phone" value={form.phone} onChange={changeInput} />
                </div>
                <div>
                    <label>Address</label>
                    <input name="address" value={form.address} onChange={changeInput} />
                </div>
                <div className="wide">
                    <button className="btn" type="submit">Save profile</button>
                </div>
            </form>
        </div>
    );
}

export default ProfilePage;
