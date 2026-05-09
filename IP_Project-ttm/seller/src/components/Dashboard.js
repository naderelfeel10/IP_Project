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

    return (
        <div className="page">
            <div className="topbar">
                <div>
                    <h1>{seller.storeName || 'Seller Dashboard'}</h1>
                    <p>Welcome {seller.username}</p>
                </div>
                <button className="logout-btn" onClick={onLogout}>Logout</button>
            </div>

            <div className="layout">
                <div className="side-menu">
                    <button className={page === 'products' ? 'active' : ''} onClick={() => setPage('products')}>Products</button>
                    <button className={page === 'categories' ? 'active' : ''} onClick={() => setPage('categories')}>Categories</button>
                    <button className={page === 'orders' ? 'active' : ''} onClick={() => setPage('orders')}>Orders</button>
                    <button className={page === 'flags' ? 'active' : ''} onClick={() => setPage('flags')}>Buyer flags</button>
                    <button className={page === 'profile' ? 'active' : ''} onClick={() => setPage('profile')}>Profile</button>
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
                    {page === 'profile' && <ProfilePage />}
                </main>
            </div>
        </div>
    );
}

export default Dashboard;
