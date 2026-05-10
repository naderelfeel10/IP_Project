import { useEffect, useState } from 'react';
import { DeleteOutlined } from '@ant-design/icons';
import { Button, Input, Select } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import API from '../api';
import MainNav from '../components/MainNav';
import './CheckoutPage.css';

const getProductId = (item) => {
    return typeof item.productId === 'object' ? item.productId._id : item.productId;
};

const getProduct = (item) => {
    if (typeof item.productId === 'object') {
        return item.productId;
    }

    return null;
};

const formatPrice = (price) => {
    return `${price || 0} EGP`;
};

const getSellerServiceAreas = (items) => {
    const areas = items.flatMap((item) => {
        const product = getProduct(item);
        return product?.sellerId?.serviceArea || [];
    });

    return [...new Set(areas)];
};

function CheckoutPage() {
    const navigate = useNavigate();
    const [items, setItems] = useState([]);
    const [totalPrice, setTotalPrice] = useState(0);
    const [shippingCity, setShippingCity] = useState('');
    const [deliveryAddress, setDeliveryAddress] = useState('');
    const [buyerComment, setBuyerComment] = useState('');
    const [loading, setLoading] = useState(true);
    const [placingOrder, setPlacingOrder] = useState(false);
    const [error, setError] = useState('');

    const serviceAreas = getSellerServiceAreas(items);

    useEffect(() => {
        const loadCheckout = async () => {
            setLoading(true);
            setError('');

            try {
                const cartRes = await API.get('/cart/getCart/');
                const cart = cartRes.data.result || { itemsList: [], totalPrice: 0 };
                setItems(cart.itemsList || []);
                setTotalPrice(cart.totalPrice || 0);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to load checkout');
            } finally {
                setLoading(false);
            }
        };

        loadCheckout();
    }, []);

    const updateCheckoutFromCart = (cart) => {
        const nextCart = cart || { itemsList: [], totalPrice: 0 };
        setItems(nextCart.itemsList || []);
        setTotalPrice(nextCart.totalPrice || 0);

        const nextServiceAreas = getSellerServiceAreas(nextCart.itemsList || []);
        if (shippingCity && !nextServiceAreas.includes(shippingCity)) {
            setShippingCity('');
        }
    };

    const handlePlaceOrder = async () => {
        if (!shippingCity) {
            toast.error('Please select a delivery city');
            return;
        }

        if (!serviceAreas.includes(shippingCity)) {
            toast.error('This delivery city is not available for this seller');
            return;
        }

        if (!deliveryAddress.trim()) {
            toast.error('Please enter the delivery address');
            return;
        }

        if (items.length === 0) {
            toast.error('Cart is empty');
            return;
        }

        setPlacingOrder(true);
        setError('');

        try {
            const fullShippingAddress = `${shippingCity} - ${deliveryAddress.trim()}`;

            const res = await API.post('/orders/addOrder/', {
                itemList: items.map((item) => ({
                    productId: getProductId(item),
                    quantity: item.quantity
                })),
                shippingAddress: fullShippingAddress,
                buyerComment: buyerComment.trim(),
                stockAlreadyReserved: true
            });

            const orderCount = res.data.orders?.length || 1;
            toast.success(orderCount > 1 ? `${orderCount} orders placed successfully` : 'Order placed successfully');
            navigate('/orders');
        } catch (err) {
            const message = err.response?.data?.message || 'Failed to place order';
            setError(message);
            toast.error(message);
        } finally {
            setPlacingOrder(false);
        }
    };

    const handleRemoveItem = async (productId) => {
        try {
            const res = await API.delete(`/cart/removeItem/${productId}`);
            updateCheckoutFromCart(res.data.result);
            toast.success('Removed from cart');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to remove item');
        }
    };

    const handleIncrementItem = async (productId) => {
        try {
            const res = await API.post('/cart/addItem/', { productId, quantity: 1 });
            updateCheckoutFromCart(res.data.result);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to increase quantity');
        }
    };

    const handleDecrementItem = async (productId) => {
        try {
            const res = await API.patch(`/cart/decrementItem/${productId}`);
            updateCheckoutFromCart(res.data.result);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to decrease quantity');
        }
    };

    return (
        <main className="page-shell">
            <MainNav />
            <section className="page-header">
                <h1>Checkout</h1>
            </section>

            <section className="checkout-content">
                {loading && <p className="products-message">Loading checkout...</p>}

                {error && <p className="products-message error">{error}</p>}

                {!loading && items.length === 0 && (
                    <p className="products-message">Your cart is empty.</p>
                )}

                {!loading && items.length > 0 && (
                    <div className="checkout-layout">
                        <section className="checkout-items">
                            {items.map((item) => {
                                const productId = getProductId(item);
                                const product = getProduct(item);
                                const itemTotal = (product?.price || 0) * item.quantity;

                                return (
                                    <article className="checkout-item" key={productId}>
                                        <div>
                                            <strong>{product?.name || 'Product'}</strong>

                                            <div
                                                className="checkout-quantity-controls"
                                                aria-label={`Quantity for ${product?.name || 'Product'}`}
                                            >
                                                <Button
                                                    aria-label="Decrease quantity"
                                                    onClick={() => handleDecrementItem(productId)}
                                                    size="small"
                                                    shape="circle"
                                                >
                                                    -
                                                </Button>

                                                <span>{item.quantity}</span>

                                                <Button
                                                    aria-label="Increase quantity"
                                                    onClick={() => handleIncrementItem(productId)}
                                                    size="small"
                                                    shape="circle"
                                                >
                                                    +
                                                </Button>
                                            </div>

                                            {product?.deliveryTimeEstimate && (
                                                <span>{product.deliveryTimeEstimate}</span>
                                            )}
                                        </div>

                                        <div className="checkout-item-actions">
                                            <strong>{formatPrice(itemTotal)}</strong>

                                            <Button
                                                aria-label="Remove item"
                                                className="checkout-trash-button"
                                                onClick={() => handleRemoveItem(productId)}
                                                size="small"
                                                shape="circle"
                                                icon={<DeleteOutlined className="checkout-trash-icon" />}
                                                title="Remove item"
                                            />
                                        </div>
                                    </article>
                                );
                            })}
                        </section>

                        <aside className="checkout-summary">
                            <label className="checkout-comment-field">
                                Delivery city
                                <Select
                                    disabled={serviceAreas.length === 0}
                                    onChange={setShippingCity}
                                    options={serviceAreas.map((area) => ({
                                        label: area,
                                        value: area
                                    }))}
                                    placeholder="Select delivery city"
                                    value={shippingCity || undefined}
                                />
                            </label>

                            <label className="checkout-comment-field">
                                Address in this city
                                <Input
                                    disabled={!shippingCity}
                                    onChange={(e) => setDeliveryAddress(e.target.value)}
                                    placeholder="Street, building, apartment"
                                    value={deliveryAddress}
                                />
                            </label>

                            {serviceAreas.length === 0 && (
                                <span>No delivery locations are available for this seller.</span>
                            )}

                            <label className="checkout-comment-field">
                                Comment
                                <Input.TextArea
                                    autoSize={{ minRows: 3, maxRows: 5 }}
                                    onChange={(e) => setBuyerComment(e.target.value)}
                                    placeholder="Add a note for this order"
                                    value={buyerComment}
                                />
                            </label>

                            <div>
                                <span>Total</span>
                                <strong>{formatPrice(totalPrice)}</strong>
                            </div>

                            <Button
                                block
                                disabled={serviceAreas.length === 0}
                                loading={placingOrder}
                                onClick={handlePlaceOrder}
                                type="primary"
                            >
                                Place order
                            </Button>

                            <Link to="/">Continue shopping</Link>
                        </aside>
                    </div>
                )}
            </section>
        </main>
    );
}

export default CheckoutPage;
