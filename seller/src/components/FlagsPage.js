import { useEffect, useState } from 'react';
import API from '../api';

function FlagsPage() {
    const [flags, setFlags] = useState([]);
    const [error, setError] = useState('');

    const loadFlags = async () => {
        try {
            const res = await API.get('/seller/flags');
            setFlags(res.data.flags);
        } catch (err) {
            setError(err.response?.data?.message || 'cannot load flags');
        }
    };

    useEffect(() => {
        loadFlags();
    }, []);

    return (
        <div className="section">
            <h2>Buyer flags</h2>
            {error && <p className="error">{error}</p>}

            {flags.length === 0 ? (
                <p className="empty">No buyer flags yet.</p>
            ) : (
                <table className="table">
                    <thead>
                        <tr>
                            <th>Buyer</th>
                            <th>Reason</th>
                            <th>Details</th>
                            <th>Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {flags.map((flag) => (
                            <tr key={flag._id}>
                                <td>{flag.buyerId?.username || 'Buyer'}</td>
                                <td>{flag.reason}</td>
                                <td>{flag.details || '-'}</td>
                                <td>{new Date(flag.createdAt).toLocaleDateString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default FlagsPage;
