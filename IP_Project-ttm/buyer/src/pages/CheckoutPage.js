import { useEffect, useState } from 'react';
import { Button, Input } from 'antd';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import API from '../api';
import MainNav from '../components/MainNav';
import './OrdersPage.css';

const getProduct = (item) => {
    return typeof item.productId === 'object' ? item.productId : null;
};

function CheckoutPage() {
    const navigate = useNavigate();
    const [cart, setCart] = useState({ itemsList: [], totalPrice: 0 });
    const [shippingAddress, setShippingAddress] = useState('');
    const [buyerComment, setBuyerComment] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const loadCart = async () => {
        setLoading(true);
        setError('');

        try {
            const res = await API.get('/cart/getCart/');
            setCart(res.data.result || { itemsList: [], totalPrice: 0 });
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load cart');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCart();
    }, []);

    const placeOrder = async () => {
        if (!shippingAddress.trim()) {
            toast.error('Shipping address is required');
            return;
        }

        if (!cart.itemsList || cart.itemsList.length === 0) {
            toast.error('Cart is empty');
            return;
        }

        setSaving(true);

        try {
            const itemList = cart.itemsList.map((item) => ({
                productId: getProduct(item)?._id || item.productId,
                quantity: item.quantity
            }));

            await API.post('/orders/addOrder/', {
                itemList: itemList,
                shippingAddress: shippingAddress,
                buyerComment: buyerComment,
                stockAlreadyReserved: true
            });

            toast.success('Order placed');
            navigate('/orders');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to place order');
        } finally {
            setSaving(false);
        }
    };

    return (
        <main className="page-shell">
            <MainNav />
            <section className="page-header">
                <h1>Checkout</h1>
            </section>
            <section className="orders-content">
                {loading && <p className="products-message">Loading cart...</p>}
                {error && <p className="products-message error">{error}</p>}
                {!loading && !error && cart.itemsList.length === 0 && (
                    <p className="products-message">Your cart is empty.</p>
                )}
                {!loading && !error && cart.itemsList.length > 0 && (
                    <article className="order-card">
                        <div className="order-card-header">
                            <strong>Order items</strong>
                            <strong>{cart.totalPrice || 0} EGP</strong>
                        </div>
                        <div className="order-items">
                            {cart.itemsList.map((item) => {
                                const product = getProduct(item);
                                const productId = product?._id || item.productId;

                                return (
                                    <div className="order-item" key={productId}>
                                        <div>
                                            <strong>{product?.name || 'Product'}</strong>
                                            <span>Qty {item.quantity}</span>
                                        </div>
                                        <strong>{(product?.price || 0) * item.quantity} EGP</strong>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="review-form">
                            <label>
                                Shipping address
                                <Input
                                    onChange={(e) => setShippingAddress(e.target.value)}
                                    placeholder="Delivery address"
                                    value={shippingAddress}
                                />
                            </label>
                            <label>
                                Comment
                                <Input.TextArea
                                    autoSize={{ minRows: 3, maxRows: 5 }}
                                    onChange={(e) => setBuyerComment(e.target.value)}
                                    placeholder="Any delivery notes"
                                    value={buyerComment}
                                />
                            </label>
                            <Button loading={saving} onClick={placeOrder} type="primary">
                                Place order
                            </Button>
                        </div>
                    </article>
                )}
            </section>
        </main>
    );
}

export default CheckoutPage;
