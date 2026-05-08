import { useState } from 'react';
import { DeleteOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import { Button, Drawer, Input } from 'antd';
import { NavLink, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import API from '../api';
import { clearAuthToken, getAuthUser } from '../auth';
import './MainNav.css';

const { Search } = Input;

const getInitials = (username) => {
    if(!username){
        return 'U';
    }

    return username
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0])
        .join('')
        .toUpperCase();
};

const getCartProduct = (item) => {
    return typeof item.productId === 'object' ? item.productId : null;
};

const getCartItemName = (item) => {
    const product = getCartProduct(item);
    return product?.name || 'Product';
};

const getCartItemPrice = (item) => {
    const product = getCartProduct(item);
    return product?.price || 0;
};

function MainNav() {
    const [isOpen, setIsOpen] = useState(false);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [cart, setCart] = useState({ itemsList: [], totalPrice: 0 });
    const [cartLoading, setCartLoading] = useState(false);
    const [cartError, setCartError] = useState('');
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const authUser = getAuthUser();
    const initials = getInitials(authUser?.username);
    const cartItems = cart?.itemsList || [];

    const closeDrawer = () => {
        setIsOpen(false);
    };

    const loadCart = async () => {
        setCartLoading(true);
        setCartError('');

        try {
            const res = await API.get('/cart/getCart/');
            setCart(res.data.result || { itemsList: [], totalPrice: 0 });
        } catch (err) {
            setCart({ itemsList: [], totalPrice: 0 });
            setCartError(err.response?.data?.message || 'Failed to load cart');
        } finally {
            setCartLoading(false);
        }
    };

    const handleSignOut = () => {
        clearAuthToken();
        window.location.href = '/signin';
    };

    const handleSearch = (value) => {
        const search = value.trim();

        if(search){
            navigate(`/?search=${encodeURIComponent(search)}`);
        }else{
            navigate('/');
        }
    };

    const handleOpenCart = () => {
        setIsCartOpen(true);
        loadCart();
    };

    const handleCheckout = () => {
        setIsCartOpen(false);
        navigate('/checkout');
    };

    const updateCartFromResponse = (res) => {
        setCart(res.data.result || { itemsList: [], totalPrice: 0 });
    };

    const handleIncrementCartItem = async (productId) => {
        try {
            const res = await API.post('/cart/addItem/', { productId, quantity: 1 });
            updateCartFromResponse(res);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to increase quantity');
        }
    };

    const handleDecrementCartItem = async (productId) => {
        try {
            const res = await API.patch(`/cart/decrementItem/${productId}`);
            updateCartFromResponse(res);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to decrease quantity');
        }
    };

    const handleRemoveCartItem = async (productId) => {
        try {
            const res = await API.delete(`/cart/removeItem/${productId}`);
            updateCartFromResponse(res);
            toast.success('Removed from cart');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to remove item');
        }
    };

    return (
        <header className="main-nav">
            <NavLink className="brand-button" to="/">
                Buyer App
            </NavLink>
            <Search
                allowClear
                className="header-search"
                defaultValue={searchParams.get('search') || ''}
                onSearch={handleSearch}
                placeholder="Search products"
            />
            <div className='menu-container'>
                <Button
                    aria-label="Open cart"
                    className="cart-menu-button"
                    onClick={handleOpenCart}
                    shape="circle"
                >
                    <ShoppingCartOutlined className="cart-menu-icon" />
                </Button>
            <Button
                aria-label="Open user menu"
                className="profile-menu-button"
                onClick={() => setIsOpen(true)}
                shape="circle"
                type="primary"
            >
                <span aria-hidden="true" className="profile-menu-icon">{initials}</span>
            </Button>
            </div>

            <Drawer
                open={isOpen}
                onClose={closeDrawer}
                placement="right"
                title={authUser?.email || 'User'}
                width={320}
            >
                <nav className="drawer-links">
                    <NavLink to="/profile" onClick={closeDrawer}>User profile</NavLink>
                    <NavLink to="/orders" onClick={closeDrawer}>Orders</NavLink>
                    <Button className="drawer-signout" danger onClick={handleSignOut} type="default">
                        Sign out
                    </Button>
                </nav>
            </Drawer>
            <Drawer
                footer={
                    <div className="cart-drawer-footer">
                        <div>
                            <span>Total</span>
                            <strong>{cart?.totalPrice || 0} EGP</strong>
                        </div>
                        <Button
                            block
                            disabled={cartItems.length === 0}
                            onClick={handleCheckout}
                            type="primary"
                        >
                            Checkout
                        </Button>
                    </div>
                }
                open={isCartOpen}
                onClose={() => setIsCartOpen(false)}
                placement="right"
                title="Cart"
                width={360}
            >
                {cartLoading && <p className="cart-drawer-message">Loading cart...</p>}
                {cartError && <p className="cart-drawer-message error">{cartError}</p>}
                {!cartLoading && !cartError && cartItems.length === 0 && (
                    <p className="cart-drawer-message">Your cart is empty.</p>
                )}
                {!cartLoading && cartItems.length > 0 && (
                    <div className="cart-drawer-list">
                        {cartItems.map((item) => {
                            const productId = getCartProduct(item)?._id || item.productId;

                            return (
                                <article className="cart-drawer-item" key={productId}>
                                    <div>
                                        <strong>{getCartItemName(item)}</strong>
                                        <div className="cart-quantity-controls" aria-label={`Quantity for ${getCartItemName(item)}`}>
                                            <Button
                                                aria-label="Decrease quantity"
                                                onClick={() => handleDecrementCartItem(productId)}
                                                size="small"
                                            >
                                                -
                                            </Button>
                                            <span>{item.quantity}</span>
                                            <Button
                                                aria-label="Increase quantity"
                                                onClick={() => handleIncrementCartItem(productId)}
                                                size="small"
                                            >
                                                +
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="cart-drawer-item-actions">
                                        <strong>{getCartItemPrice(item) * item.quantity} EGP</strong>
                                        <Button
                                            aria-label="Remove item"
                                            className="cart-trash-button"
                                            danger
                                            onClick={() => handleRemoveCartItem(productId)}
                                            size="small"
                                            title="Remove item"
                                        >
                                            <DeleteOutlined className="cart-trash-icon" />
                                        </Button>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                )}
            </Drawer>
        </header>
    );
}

export default MainNav;
