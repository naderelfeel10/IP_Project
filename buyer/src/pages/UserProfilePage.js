import { getAuthPayload, getAuthUser } from '../auth';
import MainNav from '../components/MainNav';
import './UserProfilePage.css';

function UserProfilePage() {
    const user = getAuthUser();
    const payload = getAuthPayload();

    return (
        <main className="page-shell">
            <MainNav />
            <section className="page-header">
                <h1>User Profile</h1>
            </section>
            <section className="profile-panel">
                {user ? (
                    <div className="profile-details">
                        <div>
                            <span>Username</span>
                            <strong>{user.username || 'Not available'}</strong>
                        </div>
                        <div>
                            <span>Email</span>
                            <strong>{user.email || 'Not available'}</strong>
                        </div>
                        <div>
                            <span>Account type</span>
                            <strong>{payload?.type || 'Not available'}</strong>
                        </div>
                    </div>
                ) : (
                    <p className="profile-empty">No user data found in the saved token.</p>
                )}
            </section>
        </main>
    );
}

export default UserProfilePage;
