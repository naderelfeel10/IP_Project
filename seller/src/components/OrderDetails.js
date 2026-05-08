function OrderDetails({ order }) {
    return (
        <div className="order-box">
            <p><strong>Buyer:</strong> {order.buyerId?.username || 'Unknown buyer'}</p>
            <p><strong>Email:</strong> {order.buyerId?.email || '-'}</p>
            <p><strong>Delivery address:</strong> {order.shippingAddress || '-'}</p>
            <p><strong>Comment:</strong> {order.orderComment || '-'}</p>
            <p><strong>Total:</strong> {order.totalPrice} EGP</p>
            <p><strong>Status:</strong> <span className="status">{order.status}</span></p>

            <strong>Items</strong>
            <ul className="order-items">
                {order.itemsList.map((item) => (
                    <li key={item._id || item.productId?._id}>
                        {item.productId?.name || 'Product'} - quantity {item.quantity}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default OrderDetails;
