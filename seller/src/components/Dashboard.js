import { useEffect, useState } from 'react';
import API from '../api';
import ProductsPage from './ProductsPage';
import CategoriesPage from './CategoriesPage';
import OrdersPage from './OrdersPage';
import FlagsPage from './FlagsPage';
import ProfilePage from './ProfilePage';

function Dashboard({ seller, onLogout }) {
    const [page, setPage] = useState('products');
    const [stats, setStats] = useState({
        productsCount: 0,
        categoriesCount: 0,
        ordersCount: 0,
        flagsCount: 0
    });

    const loadStats = async () => {
        try {
            const res = await API.get('/seller/getSellerStore');
            setStats(res.data.store);
        } catch (error) {
            console.log(error.message);
        }
    };

    useEffect(() => {
        loadStats();
    }, []);

    // get first letter of username for avatar
    const avatarLetter = seller.username ? seller.username[0].toUpperCase() : 'S';

    return (
        <div className="page">
            <div className="topbar">
                <div>
                    <h1>{seller.storeName || 'Seller Dashboard'}</h1>
                    <p>Welcome {seller.username}</p>
                </div>

                {/* header right side */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>

                    {/* profile avatar — click to go to profile page */}
                    <div
                        onClick={() => setPage('profile')}
                        style={{
                            width: '38px',
                            height: '38px',
                            borderRadius: '50%',
                            background: '#1565c0',
                            color: '#fff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: '700',
                            fontSize: '16px',
                            cursor: 'pointer',
                            userSelect: 'none',
                            title: 'Profile'
                        }}
                        title="Profile"
                    >
                        {avatarLetter}
                    </div>

                    {/* logout button */}
                    <button className="logout-btn" onClick={onLogout}>
                        <i className="fa-solid fa-arrow-right-from-bracket"></i>
                    </button>
                </div>
            </div>

            <div className="layout">
                <div className="side-menu">
                    <button className={page === 'products' ? 'active' : ''} onClick={() => setPage('products')}>Products</button>
                    <button className={page === 'categories' ? 'active' : ''} onClick={() => setPage('categories')}>Categories</button>
                    <button className={page === 'orders' ? 'active' : ''} onClick={() => setPage('orders')}>Orders</button>
                    <button className={page === 'flags' ? 'active' : ''} onClick={() => setPage('flags')}>Buyer flags</button>
                    <button className={page === 'profile' ? 'active' : ''} onClick={() => setPage('profile')}>
                        <i className="fa-solid fa-user" style={{ marginRight: '6px' }}></i>
                        Profile
                    </button>
                </div>

                <main className="content">
                    <div className="stats">
                        <div className="stat-box">
                            <span>Products</span>
                            <strong>{stats.productsCount}</strong>
                        </div>
                        <div className="stat-box">
                            <span>Categories</span>
                            <strong>{stats.categoriesCount}</strong>
                        </div>
                        <div className="stat-box">
                            <span>Orders</span>
                            <strong>{stats.ordersCount}</strong>
                        </div>
                        <div className="stat-box">
                            <span>Flags</span>
                            <strong>{stats.flagsCount}</strong>
                        </div>
                    </div>

                    {page === 'products' && <ProductsPage onChange={loadStats} />}
                    {page === 'categories' && <CategoriesPage onChange={loadStats} />}
                    {page === 'orders' && <OrdersPage onChange={loadStats} />}
                    {page === 'flags' && <FlagsPage />}
                    {page === 'profile' && <ProfilePage onLogout={onLogout} />}
                </main>
            </div>
        </div>
    );
}

export default Dashboard;