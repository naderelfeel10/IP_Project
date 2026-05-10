import { useEffect, useState } from 'react';
import { Button, InputNumber } from 'antd';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import API from '../api';
import MainNav from '../components/MainNav';
import './ProductDetailsPage.css';

const formatRating = (rating) => {
    return rating ? (
        <span className="rating-value"><span aria-hidden="true">★</span> {rating}/5</span>
    ) : 'No rating yet';
};

const getSellerId = (product) => {
    if(!product?.sellerId){
        return '';
    }

    return typeof product.sellerId === 'object' ? product.sellerId._id : product.sellerId;
};

const ProductImage = ({ product }) => {
    if(product.imageUrl){
        return (
            <img
                alt={product.name}
                className="details-product-image"
                src={product.imageUrl}
            />
        );
    }

    return (
        <div className="details-product-image details-product-image-empty" aria-hidden="true">
            <span>{(product.name || 'P').charAt(0).toUpperCase()}</span>
        </div>
    );
};

function ProductDetailsPage() {
    const { productId } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [sellersById, setSellersById] = useState({});
    const [buyersById, setBuyersById] = useState({});
    const [quantity, setQuantity] = useState(1);
    const [actionLoading, setActionLoading] = useState('');
    const [actionError, setActionError] = useState('');
    const [reviewSummary, setReviewSummary] = useState(null);
    const [summaryLoading, setSummaryLoading] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const loadDetails = async () => {
            setLoading(true);
            setError('');

            try {
                const [productRes, reviewsRes, sellersRes, buyersRes] = await Promise.all([
                    API.get(`/products/getProduct/${productId}`),
                    API.get(`/products/getReviewsByProduct/${productId}`),
                    API.get('/seller/getAllSellers'),
                    API.get('/buyer/getAllBuyers')
                ]);

                const sellerMap = (sellersRes.data.result || []).reduce((map, seller) => {
                    map[seller._id] = seller.storeName || seller.username || seller.email || 'Seller';
                    return map;
                }, {});

                const buyerMap = (buyersRes.data.result || []).reduce((map, buyer) => {
                    map[buyer._id] = buyer.username || buyer.email || 'Buyer';
                    return map;
                }, {});

                setProduct(productRes.data.result);
                setReviews(reviewsRes.data.result || []);
                setSellersById(sellerMap);
                setBuyersById(buyerMap);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to load product details');
            } finally {
                setLoading(false);
            }
        };

        loadDetails();
    }, [productId]);

    const sellerId = getSellerId(product);
    const productQuantity = product?.quantity ?? 0;
    const isOutOfStock = productQuantity < 1;
    const clampedQuantity = Math.min(quantity || 1, productQuantity || 1);

    const resetActionState = () => {
        setActionError('');
    };

    const handleAddToCart = async () => {
        resetActionState();
        setActionLoading('cart');

        try {
            await API.post('/cart/addItem/', {
                productId,
                quantity: clampedQuantity
            });
            toast.success('Added to cart');
        } catch (err) {
            const message = err.response?.data?.message || 'Failed to add product to cart';
            setActionError(message);
            toast.error(message);
        } finally {
            setActionLoading('');
        }
    };

    const handleBuyNow = async () => {
        resetActionState();
        setActionLoading('buy');

        try {
            await API.post('/cart/addItem/', {
                productId,
                quantity: clampedQuantity
            });
            navigate('/checkout');
        } catch (err) {
            const message = err.response?.data?.message || 'Failed to start checkout';
            setActionError(message);
            toast.error(message);
        } finally {
            setActionLoading('');
        }
    };

    const handleGenerateSummary = async () => {
        setSummaryLoading(true);

        try {
            const res = await API.get(`/products/getReviewSummary/${productId}`);
            setReviewSummary(res.data.result);
            toast.success('Review summary generated');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to generate review summary');
        } finally {
            setSummaryLoading(false);
        }
    };

    return (
        <main className="page-shell">
            <MainNav />
            <section className="page-header">
                <h1>{product?.name || 'Product details'}</h1>
            </section>
            <section className="details-content">
                {loading && <p className="products-message">Loading product details...</p>}
                {error && <p className="products-message error">{error}</p>}
                {!loading && !error && product && (
                    <>
                        <section className="details-card">
                            <ProductImage product={product} />
                            <div className="details-grid">
                                <div>
                                    <span>Name</span>
                                    <strong>{product.name}</strong>
                                </div>
                                <div>
                                    <span>Seller</span>
                                    {sellerId ? (
                                        <Link className="seller-link" to={`/seller/${sellerId}`}>
                                            {sellersById[sellerId] || 'Seller'}
                                        </Link>
                                    ) : (
                                        <strong>Unknown seller</strong>
                                    )}
                                </div>
                                <div>
                                    <span>Category</span>
                                    <strong>{product.category || 'Other'}</strong>
                                </div>
                                <div>
                                    <span>Price</span>
                                    <strong>{product.price} EGP</strong>
                                </div>
                                <div>
                                    <span>Quantity</span>
                                    <strong>{product.quantity ?? 'Not available'}</strong>
                                </div>
                                <div>
                                    <span>Delivery estimate</span>
                                    <strong>{product.deliveryTimeEstimate || 'Not available'}</strong>
                                </div>
                                <div>
                                    <span>Average rating</span>
                                    <strong>{formatRating(product.avgRating)}</strong>
                                </div>
                                <div>
                                    <span>Created at</span>
                                    <strong>{product.createdAt ? new Date(product.createdAt).toLocaleDateString() : 'Not available'}</strong>
                                </div>
                            </div>
                            <div className="details-description">
                                <span>Description</span>
                                <p>{product.description || 'No description available.'}</p>
                            </div>
                            <div className="purchase-panel">
                                <label>
                                    Quantity
                                    <InputNumber
                                        disabled={isOutOfStock || Boolean(actionLoading)}
                                        min={1}
                                        max={productQuantity || 1}
                                        onChange={(value) => setQuantity(value || 1)}
                                        value={clampedQuantity}
                                    />
                                </label>
                                <div className="purchase-actions">
                                    <Button
                                        disabled={isOutOfStock || Boolean(actionLoading)}
                                        loading={actionLoading === 'cart'}
                                        onClick={handleAddToCart}
                                    >
                                        Add to cart
                                    </Button>
                                    <Button
                                        disabled={isOutOfStock || Boolean(actionLoading)}
                                        loading={actionLoading === 'buy'}
                                        onClick={handleBuyNow}
                                        type="primary"
                                    >
                                        Buy now
                                    </Button>
                                </div>
                                {isOutOfStock && <p className="action-message error">This product is out of stock.</p>}
                                {actionError && <p className="action-message error">{actionError}</p>}
                            </div>
                        </section>

                        <section className="reviews-section">
                            <div className="reviews-section-header">
                                <h2>Reviews</h2>
                                <Button
                                    disabled={reviews.length === 0}
                                    loading={summaryLoading}
                                    onClick={handleGenerateSummary}
                                >
                                    Generate summary
                                </Button>
                            </div>
                            {reviewSummary && (
                                <article className="review-summary-card">
                                    <div>
                                        <span>AI summary</span>
                                        <strong>{reviewSummary.reviewCount} reviews · {formatRating(reviewSummary.averageRating)}</strong>
                                    </div>
                                    <p>{reviewSummary.summary || 'No summary available.'}</p>
                                </article>
                            )}
                            {reviews.length === 0 && <p className="products-message">No reviews yet.</p>}
                            {reviews.length > 0 && (
                                <div className="reviews-list">
                                    {reviews.map((review) => (
                                        <article className="review-card" key={review._id}>
                                            <div className="review-header">
                                                <strong>{buyersById[review.buyerId] || 'Buyer'}</strong>
                                                <span>{formatRating(review.rating)}</span>
                                            </div>
                                            <p>{review.commentText || 'No comment provided.'}</p>
                                        </article>
                                    ))}
                                </div>
                            )}
                        </section>
                    </>
                )}
            </section>
        </main>
    );
}

export default ProductDetailsPage;
