import { useCallback, useEffect, useState } from 'react';
import API from '../api';
import OrderDetails from './OrderDetails';
import FlagBuyerForm from './FlagBuyerForm';

const statuses = [
    'Pending',
    'Accepted',
    'Preparing',
    'Out for delivery',
    'Delivered',
    'Cancelled',
    'Failed delivery'
];

function OrdersPage({ onChange }) {
    const [orders, setOrders] = useState([]);
    const [statusFilter, setStatusFilter] = useState('');
    const [openOrder, setOpenOrder] = useState('');
    const [flagOrder, setFlagOrder] = useState(null);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const loadOrders = useCallback(async () => {
        try {
            setError('');
            const url = statusFilter ? '/orders/myOrders/' + encodeURIComponent(statusFilter) : '/orders/myOrders';
            const res = await API.get(url);
            setOrders(res.data.orders);
        } catch (err) {
            setError(err.response?.data?.message || 'cannot load orders');
        }
    }, [statusFilter]);

    useEffect(() => {
        loadOrders();
    }, [loadOrders]);

    const changeOrderStatus = async (orderId, status) => {
        try {
            await API.put('/orders/updateOrder/' + orderId, { status: status });
            setMessage('order status updated');
            loadOrders();
        } catch (err) {
            setError(err.response?.data?.message || 'cannot update order');
        }
    };

    const doneFlagging = () => {
        setFlagOrder(null);
        setMessage('buyer flag saved');
        onChange();
    };

    return (
        <div className="section">
            <div className="toolbar">
                <h2>Received orders</h2>
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                    <option value="">All statuses</option>
                    {statuses.map((status) => (
                        <option key={status} value={status}>{status}</option>
                    ))}
                </select>
            </div>

            {message && <p className="message">{message}</p>}
            {error && <p className="error">{error}</p>}

            {orders.length === 0 ? (
                <p className="empty">No orders received yet.</p>
            ) : (
                <table className="table">
                    <thead>
                        <tr>
                            <th>Buyer</th>
                            <th>Total</th>
                            <th>Status</th>
                            <th>Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map((order) => (
                            <tr key={order._id}>
                                <td>{order.buyerId?.username || 'Unknown'}</td>
                                <td>{order.totalPrice} EGP</td>
                                <td>
                                    <select value={order.status} onChange={(e) => changeOrderStatus(order._id, e.target.value)}>
                                        {statuses.map((status) => (
                                            <option key={status} value={status}>{status}</option>
                                        ))}
                                    </select>
                                </td>
                                <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                                <td>
                                    <button className="btn small light" onClick={() => setOpenOrder(openOrder === order._id ? '' : order._id)}>Details</button>
                                    <button className="btn small light" onClick={() => setFlagOrder(order)}>Flag buyer</button>

                                    {openOrder === order._id && <OrderDetails order={order} />}
                                    {flagOrder?._id === order._id && <FlagBuyerForm order={order} onDone={doneFlagging} />}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default OrdersPage;
