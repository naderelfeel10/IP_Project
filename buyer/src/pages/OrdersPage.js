import { useEffect, useState } from 'react';
import { Button, Input, Modal, Rate, Select } from 'antd';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import API from '../api';
import MainNav from '../components/MainNav';
import './OrdersPage.css';

const getProduct = (item) => {
    return typeof item.productId === 'object' ? item.productId : null;
};

const formatDate = (date) => {
    return date ? new Date(date).toLocaleDateString() : 'Not available';
};

function OrdersPage() {
    const [orders, setOrders] = useState([]);
    const [reviewsByProductId, setReviewsByProductId] = useState({});
    const [reviewProduct, setReviewProduct] = useState(null);
    const [editingReview, setEditingReview] = useState(null);
    const [reviewRating, setReviewRating] = useState(5);
    const [reviewComment, setReviewComment] = useState('');
    const [reviewLoading, setReviewLoading] = useState(false);
    const [issueOrder, setIssueOrder] = useState(null);
    const [issueScope, setIssueScope] = useState('Order');
    const [issueProductId, setIssueProductId] = useState('');
    const [issueDescription, setIssueDescription] = useState('');
    const [issueLoading, setIssueLoading] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const loadOrders = async () => {
            setLoading(true);
            setError('');

            try {
                const res = await API.get('/orders/getAllOrders/');
                const nextOrders = res.data.result || [];
                setOrders(nextOrders);

                const reviewsRes = await API.get('/products/myReviews');
                const reviewsMap = {};

                (reviewsRes.data.result || []).forEach((review) => {
                    const productId = review.productId;

                    if(productId){
                        reviewsMap[productId] = review;
                    }
                });

                setReviewsByProductId(reviewsMap);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to load orders');
            } finally {
                setLoading(false);
            }
        };

        loadOrders();
    }, []);

    const openReviewModal = (product, existingReview = null) => {
        setReviewProduct(product);
        setEditingReview(existingReview);
        setReviewRating(existingReview?.rating || 5);
        setReviewComment(existingReview?.commentText || '');
    };

    const closeReviewModal = () => {
        setReviewProduct(null);
        setEditingReview(null);
        setReviewRating(5);
        setReviewComment('');
    };

    const handleSubmitReview = async () => {
        if(!reviewProduct?._id){
            return;
        }

        setReviewLoading(true);

        try {
            const payload = {
                productId: reviewProduct._id,
                rating: reviewRating,
                commentText: reviewComment.trim()
            };

            const res = editingReview
                ? await API.put('/products/updateComment/', payload)
                : await API.post('/products/addComment/', payload);

            setReviewsByProductId((current) => ({
                ...current,
                [reviewProduct._id]: res.data.review
            }));
            toast.success(editingReview ? 'Review updated' : 'Review submitted');
            closeReviewModal();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to submit review');
        } finally {
            setReviewLoading(false);
        }
    };

    const openIssueModal = (order) => {
        const firstProduct = (order.itemsList || [])
            .map((item) => getProduct(item))
            .find(Boolean);

        setIssueOrder(order);
        setIssueScope('Order');
        setIssueProductId(firstProduct?._id || '');
        setIssueDescription('');
    };

    const closeIssueModal = () => {
        setIssueOrder(null);
        setIssueScope('Order');
        setIssueProductId('');
        setIssueDescription('');
    };

    const handleSubmitIssue = async () => {
        if(!issueOrder?._id){
            return;
        }

        if(!issueDescription.trim()){
            toast.error('Please describe the issue');
            return;
        }

        if(issueScope !== 'Order' && !issueProductId){
            toast.error('Please choose the related product');
            return;
        }

        setIssueLoading(true);

        try {
            await API.post(`/orders/reportIssue/${issueOrder._id}`, {
                issueScope,
                issueDescription: issueDescription.trim(),
                productId: issueScope === 'Order' ? undefined : issueProductId
            });

            toast.success('Issue reported');
            closeIssueModal();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to report issue');
        } finally {
            setIssueLoading(false);
        }
    };

    return (
        <main className="page-shell">
            <MainNav />
            <section className="page-header">
                <h1>Orders</h1>
            </section>
            <section className="orders-content">
                {loading && <p className="products-message">Loading orders...</p>}
                {error && <p className="products-message error">{error}</p>}
                {!loading && !error && orders.length === 0 && (
                    <p className="products-message">No orders yet.</p>
                )}
                {!loading && !error && orders.length > 0 && (
                    <div className="orders-list">
                        {orders.map((order) => (
                            <article className="order-card" key={order._id}>
                                <div className="order-card-header">
                                    <div>
                                        <strong>Order #{order._id.slice(-6).toUpperCase()}</strong>
                                        <span>{formatDate(order.createdAt)}</span>
                                    </div>
                                    <span className="order-status">{order.status || 'Pending'}</span>
                                </div>
                                <div className="order-items">
                                    {(order.itemsList || []).map((item) => {
                                        const product = getProduct(item);
                                        const productId = product?._id || item.productId;
                                        const canReview = order.status === 'Delivered' && product?._id;
                                        const existingReview = reviewsByProductId[productId];

                                        return (
                                            <div className="order-item" key={productId}>
                                                <div>
                                                    {productId ? (
                                                        <Link className="order-product-link" to={`/products/${productId}`}>
                                                            {product?.name || 'Product'}
                                                        </Link>
                                                    ) : (
                                                        <span>{product?.name || 'Product'}</span>
                                                    )}
                                                    <span>Qty {item.quantity}</span>
                                                </div>
                                                {canReview && (
                                                    <Button size="small" onClick={() => openReviewModal(product, existingReview)}>
                                                        {existingReview ? 'Edit review' : 'Review'}
                                                    </Button>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                                <div className="order-total">
                                    <span>Total</span>
                                    <strong>{order.totalPrice || 0} EGP</strong>
                                </div>
                                {order.buyerComment && (
                                    <div className="order-comment">
                                        <span>Comment</span>
                                        <p>{order.buyerComment}</p>
                                    </div>
                                )}
                                <section className="order-issue-section">
                                    <div>
                                        <strong>Having any issues with your order?</strong>
                                        <span>Report whether it is about the whole order, a product, or the seller.</span>
                                    </div>
                                    <div>
                                        <Button onClick={() => openIssueModal(order)} size="small">
                                            Report issue
                                        </Button>
                                    </div>
                                </section>
                            </article>
                        ))}
                    </div>
                )}
            </section>
            <Modal
                confirmLoading={reviewLoading}
                okText="Submit review"
                onCancel={closeReviewModal}
                onOk={handleSubmitReview}
                open={Boolean(reviewProduct)}
                title={reviewProduct ? `${editingReview ? 'Edit review for' : 'Review'} ${reviewProduct.name}` : 'Review product'}
            >
                <div className="review-form">
                    <label>
                        Rating
                        <Rate onChange={setReviewRating} value={reviewRating} />
                    </label>
                    <label>
                        Comment
                        <Input.TextArea
                            autoSize={{ minRows: 3, maxRows: 5 }}
                            onChange={(e) => setReviewComment(e.target.value)}
                            placeholder="Share your thoughts"
                            value={reviewComment}
                        />
                    </label>
                </div>
            </Modal>
            <Modal
                confirmLoading={issueLoading}
                okText="Report issue"
                onCancel={closeIssueModal}
                onOk={handleSubmitIssue}
                open={Boolean(issueOrder)}
                title={issueOrder ? `Report issue for order #${issueOrder._id.slice(-6).toUpperCase()}` : 'Report issue'}
            >
                <div className="issue-form">
                    <label>
                        What is this issue about?
                        <Select
                            onChange={(value) => setIssueScope(value)}
                            options={[
                                { label: 'Whole order', value: 'Order' },
                                { label: 'Specific product', value: 'Product' },
                                { label: 'Seller in general', value: 'Seller' }
                            ]}
                            value={issueScope}
                        />
                    </label>
                    {issueScope !== 'Order' && (
                        <label>
                            Related product
                            <Select
                                onChange={(value) => setIssueProductId(value)}
                                options={(issueOrder?.itemsList || []).map((item) => {
                                    const product = getProduct(item);
                                    return {
                                        label: product?.name || 'Product',
                                        value: product?._id || item.productId
                                    };
                                }).filter((option) => option.value)}
                                value={issueProductId || undefined}
                            />
                        </label>
                    )}
                    <label>
                        Issue description
                        <Input.TextArea
                            autoSize={{ minRows: 4, maxRows: 7 }}
                            onChange={(e) => setIssueDescription(e.target.value)}
                            placeholder="Describe what happened, which item or seller was involved, and what you expected."
                            value={issueDescription}
                        />
                    </label>
                </div>
            </Modal>
        </main>
    );
}

export default OrdersPage;
