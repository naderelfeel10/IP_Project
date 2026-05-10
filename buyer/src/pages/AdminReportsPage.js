import { useEffect, useState } from 'react';
import { Button } from 'antd';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import API from '../api';
import './AdminReportsPage.css';

const getUserLabel = (user) => {
    if(!user){
        return 'Not provided';
    }

    return user.storeName || user.username || user.email || user._id || 'User';
};

const getReportTitle = (flag) => {
    if(flag.issueScope){
        return `${flag.issueScope} issue`;
    }

    if(flag.sellerId && flag.buyerId){
        return 'User flag';
    }

    return flag.reason || 'Report';
};

const getReportDescription = (flag) => {
    return flag.issueDescription || flag.details || flag.reason || 'No details provided.';
};

const getUserProfileLink = (role, user) => {
    return user?._id ? `/admin/users/${role}/${user._id}` : '';
};

function AdminReportsPage() {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updatingUserId, setUpdatingUserId] = useState('');
    const [updatingFlagId, setUpdatingFlagId] = useState('');
    const [error, setError] = useState('');

    const loadReports = async () => {
        setLoading(true);
        setError('');

        try {
            const res = await API.get('/admin/flags');
            setReports(res.data.result || res.data.flags || []);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load reports');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadReports();
    }, []);

    const updateUserStatus = async (user, isActive) => {
        if(!user?._id){
            return;
        }

        setUpdatingUserId(user._id);

        try {
            await API.patch(`/admin/users/${user._id}/status`, { isActive });
            toast.success(isActive ? 'User reactivated' : 'User deactivated');
            await loadReports();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update user status');
        } finally {
            setUpdatingUserId('');
        }
    };

    const renderUserActions = (user) => {
        if(!user?._id){
            return null;
        }

        const isUpdating = updatingUserId === user._id;

        return (
            <div className="report-user-actions">
                {user.isActive ? (
                    <Button
                        loading={isUpdating}
                        onClick={() => updateUserStatus(user, false)}
                        size="small"
                    >
                        Deactivate
                    </Button>
                ) : (
                    <Button
                        loading={isUpdating}
                        onClick={() => updateUserStatus(user, true)}
                        size="small"
                    >
                        Reactivate
                    </Button>
                )}
            </div>
        );
    };

    const updateFlagStatus = async (flag, status) => {
        setUpdatingFlagId(flag._id);

        try {
            await API.patch(`/admin/flags/${flag._id}/status`, { status });
            toast.success(status === 'Resolved' ? 'Flag resolved' : 'Flag reopened');
            await loadReports();
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
                onClick={() => updateFlagStatus(flag, isResolved ? 'Open' : 'Resolved')}
                size="small"
            >
                {isResolved ? 'Reopen' : 'Resolve'}
            </Button>
        );
    };

    const openReports = reports.filter((report) => report.status !== 'Resolved').length;
    const resolvedReports = reports.filter((report) => report.status === 'Resolved').length;

    return (
        <main className="page-shell">
            <header className="admin-header">
                <h1>Admin reports</h1>
            </header>
            <section className="admin-reports-content">
                <div className="reports-summary">
                    <div className="reports-summary-card">
                        <span>Total reports</span>
                        <strong>{reports.length}</strong>
                    </div>
                    <div className="reports-summary-card">
                        <span>Open</span>
                        <strong>{openReports}</strong>
                    </div>
                    <div className="reports-summary-card">
                        <span>Resolved</span>
                        <strong>{resolvedReports}</strong>
                    </div>
                </div>

                {loading && <p className="products-message">Loading reports...</p>}
                {error && <p className="products-message error">{error}</p>}
                {!loading && !error && reports.length === 0 && (
                    <p className="products-message">No reports or issues yet.</p>
                )}
                {!loading && !error && reports.length > 0 && (
                    <div className="reports-list">
                        {reports.map((report) => (
                            <article className="report-card" key={report._id}>
                                <div className="report-card-header">
                                    <div>
                                        <h2>{getReportTitle(report)}</h2>
                                        <div className="report-meta">
                                            <span>{report.createdAt ? new Date(report.createdAt).toLocaleString() : 'No date'}</span>
                                            {report.reason && <span>Reason: {report.reason}</span>}
                                        </div>
                                    </div>
                                    <span className={`report-status ${(report.status || '').toLowerCase()}`}>
                                        {report.status || 'Open'}
                                    </span>
                                </div>

                                <p className="report-description">{getReportDescription(report)}</p>

                                <div className="report-details-grid">
                                    <div className="report-detail">
                                        <span>Reported buyer</span>
                                        {getUserProfileLink('buyer', report.buyerId) ? (
                                            <Link className="admin-user-link" to={getUserProfileLink('buyer', report.buyerId)}>
                                                {getUserLabel(report.buyerId)}
                                            </Link>
                                        ) : (
                                            <strong>{getUserLabel(report.buyerId)}</strong>
                                        )}
                                        {renderUserActions(report.buyerId)}
                                    </div>
                                    <div className="report-detail">
                                        <span>Reported seller</span>
                                        {getUserProfileLink('seller', report.sellerId) ? (
                                            <Link className="admin-user-link" to={getUserProfileLink('seller', report.sellerId)}>
                                                {getUserLabel(report.sellerId)}
                                            </Link>
                                        ) : (
                                            <strong>{getUserLabel(report.sellerId)}</strong>
                                        )}
                                        {renderUserActions(report.sellerId)}
                                    </div>
                                    <div className="report-detail">
                                        <span>Created by</span>
                                        <strong>{getUserLabel(report.userId || report.sellerId || report.buyerId)}</strong>
                                    </div>
                                    <div className="report-detail">
                                        <span>Action</span>
                                        <div>
                                        {renderFlagStatusButton(report)}
                                        </div>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </section>
        </main>
    );
}

export default AdminReportsPage;
