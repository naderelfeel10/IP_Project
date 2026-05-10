import { useEffect, useState } from 'react';
import { Button } from 'antd';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import API from '../api';
import './AdminReportsPage.css';

const getUserLabel = (user) => {
    if(!user){
        return 'User';
    }

    return user.storeName || user.username || user.email || user._id || 'User';
};

const getFlagTitle = (flag) => {
    return flag.issueScope ? `${flag.issueScope} issue` : flag.reason || 'Report';
};

const getFlagDescription = (flag) => {
    return flag.issueDescription || flag.details || flag.reason || 'No details provided.';
};

function AdminUserProfilePage() {
    const { role, userId } = useParams();
    const [user, setUser] = useState(null);
    const [flags, setFlags] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updatingFlagId, setUpdatingFlagId] = useState('');
    const [error, setError] = useState('');

    const loadUserFlags = async () => {
        setLoading(true);
        setError('');

        try {
            const res = await API.get(`/admin/users/${role}/${userId}/flags`);
            const result = res.data.result || {};
            setUser(result.user || res.data.user || null);
            setFlags(result.flags || res.data.flags || []);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load user profile');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUserFlags();
    }, [role, userId]);

    const updateFlagStatus = async (flag, status) => {
        setUpdatingFlagId(flag._id);

        try {
            await API.patch(`/admin/flags/${flag._id}/status`, { status });
            toast.success(status === 'Resolved' ? 'Flag resolved' : 'Flag reopened');
            await loadUserFlags();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update flag status');
        } finally {
            setUpdatingFlagId('');
        }
    };

    const renderFlagStatusButton = (flag) => {
        const isResolved = flag.status === 'Resolved';

        return (
            <Button
                loading={updatingFlagId === flag._id}
                onClick={() => updateFlagStatus(flag, isResolved ? 'Open' : 'Resolved')}
                size="small"
                type="default"
            >
                {isResolved ? 'Reopen' : 'Resolve'}
            </Button>
        );
    };

    return (
        <main className="page-shell">
            <header className="admin-header">
                <h1>Admin reports</h1>
            </header>
            <section className="admin-reports-content">
                <Link className="admin-back-link" to="/admin/reports">Back to reports</Link>

                {loading && <p className="products-message">Loading profile...</p>}
                {error && <p className="products-message error">{error}</p>}
                {!loading && !error && user && (
                    <>
                        <article className="report-card admin-profile-card">
                            <div className="report-card-header">
                                <div>
                                    <h2>{getUserLabel(user)}</h2>
                                    <div className="report-meta">
                                        <span>{user.type || role}</span>
                                        <span>{user.isActive ? 'Active' : 'Inactive'}</span>
                                        <span>{flags.length} flags</span>
                                    </div>
                                </div>
                                <span className={user.isActive ? 'user-state active' : 'user-state inactive'}>
                                    {user.isActive ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                            <div className="report-details-grid">
                                <div className="report-detail">
                                    <span>Email</span>
                                    <strong>{user.email || 'Not provided'}</strong>
                                </div>
                                <div className="report-detail">
                                    <span>Username</span>
                                    <strong>{user.username || 'Not provided'}</strong>
                                </div>
                                <div className="report-detail">
                                    <span>Store name</span>
                                    <strong>{user.storeName || 'Not provided'}</strong>
                                </div>
                                <div className="report-detail">
                                    <span>Phone</span>
                                    <strong>{user.phone || 'Not provided'}</strong>
                                </div>
                                <div className="report-detail">
                                    <span>Address</span>
                                    <strong>{user.address || user.shippingAddress || 'Not provided'}</strong>
                                </div>
                                <div className="report-detail">
                                    <span>Created</span>
                                    <strong>{user.createdAt ? new Date(user.createdAt).toLocaleString() : 'Not provided'}</strong>
                                </div>
                            </div>
                        </article>

                        <div className="category-header admin-flags-header">
                            <h2>Flags against this {role}</h2>
                        </div>

                        {flags.length === 0 && (
                            <p className="products-message">No flags against this user.</p>
                        )}
                        {flags.length > 0 && (
                            <div className="reports-list">
                                {flags.map((flag) => (
                                    <article className="report-card" key={flag._id}>
                                        <div className="report-card-header">
                                            <div>
                                                <h2>{getFlagTitle(flag)}</h2>
                                                <div className="report-meta">
                                                    <span>{flag.createdAt ? new Date(flag.createdAt).toLocaleString() : 'No date'}</span>
                                                    {flag.reason && <span>Reason: {flag.reason}</span>}
                                                </div>
                                            </div>
                                            <span className={`report-status ${(flag.status || '').toLowerCase()}`}>
                                                {flag.status || 'Open'}
                                            </span>
                                        </div>
                                        <p className="report-description">{getFlagDescription(flag)}</p>
                                        <div className="report-details-grid">
                                            <div className="report-detail">
                                                <span>Buyer</span>
                                                <strong>{getUserLabel(flag.buyerId)}</strong>
                                            </div>
                                            <div className="report-detail">
                                                <span>Seller</span>
                                                <strong>{getUserLabel(flag.sellerId)}</strong>
                                            </div>
                                            <div className="report-detail">
                                                <span>Created by</span>
                                                <strong>{getUserLabel(flag.userId || flag.sellerId || flag.buyerId)}</strong>
                                            </div>
                                            <div className="report-detail">
                                                <span>Action</span>
                                                {renderFlagStatusButton(flag)}
                                            </div>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </section>
        </main>
    );
}

export default AdminUserProfilePage;
