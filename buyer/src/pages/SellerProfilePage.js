import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import API from '../api';
import MainNav from '../components/MainNav';
import './Products.css';

const formatRating = (rating) => {
    return rating ? (
        <span className="rating-value"><span aria-hidden="true">★</span> {rating}/5</span>
    ) : 'No rating yet';
};

const groupProductsByCategory = (products) => {
    const groups = {};

    for (const product of products) {
        const category = product.category || 'Other';

        if(!groups[category]){
            groups[category] = [];
        }

        groups[category].push(product);
    }

    return groups;
};

const ProductImage = ({ product, className = '' }) => {
    if(product.imageUrl){
        return (
            <img
                alt={product.name}
                className={`product-image ${className}`}
                loading="lazy"
                src={product.imageUrl}
            />
        );
    }

    return (
        <div className={`product-image product-image-empty ${className}`} aria-hidden="true">
            <span>{(product.name || 'P').charAt(0).toUpperCase()}</span>
        </div>
    );
};

function SellerProfilePage() {
    const { sellerId } = useParams();
    const [sellerName, setSellerName] = useState('');
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const loadSeller = async () => {
            try {
                const res = await API.get('/seller/getAllSellers');
                const seller = (res.data.result || []).find((item) => item._id === sellerId);
                setSellerName(seller?.storeName || seller?.username || seller?.email || 'Seller');
            } catch (err) {
                setSellerName('Seller');
            }
        };

        const loadSellerProducts = async () => {
            setLoading(true);
            setError('');

            try {
                const res = await API.get(`/products/getSellerProducts/${sellerId}`);
                setProducts(res.data.result || []);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to load seller products');
            } finally {
                setLoading(false);
            }
        };

        if(sellerId){
            loadSeller();
            loadSellerProducts();
        }
    }, [sellerId]);

    const productsByCategory = groupProductsByCategory(products);
    const categories = Object.keys(productsByCategory);

    return (
        <main className="page-shell">
            <MainNav />
            <section className="page-header">
                <h1>{sellerName || 'Seller'}</h1>
            </section>
            <section className="products-content">
                <div className="category-header">
                    <h2>Products</h2>
                </div>
                {loading && <p className="products-message">Loading seller products...</p>}
                {error && <p className="products-message error">{error}</p>}
                {!loading && !error && products.length === 0 && (
                    <p className="products-message">This seller has no products yet.</p>
                )}
                {!loading && !error && categories.map((category) => (
                    <div className="category-section" key={category}>
                        <div className="category-header">
                            <h2>{category}</h2>
                        </div>
                        <div className="product-grid">
                            {productsByCategory[category].map((product) => (
                                <Link className="product-card product-clickable" key={product._id} to={`/products/${product._id}`}>
                                    <ProductImage className="product-card-image" product={product} />
                                    <div className="product-card-body">
                                        <h3>{product.name}</h3>
                                        <div className="product-meta">
                                            <span>{product.deliveryTimeEstimate || 'Delivery time unavailable'}</span>
                                            <strong>{product.price} EGP</strong>
                                        </div>
                                        <div className="product-meta seller-product-meta">
                                            <span>{formatRating(product.avgRating)}</span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                ))}
            </section>
        </main>
    );
}

export default SellerProfilePage;
