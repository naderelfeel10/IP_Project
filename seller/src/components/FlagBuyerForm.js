import { useState } from 'react';
import API from '../api';

function FlagBuyerForm({ order, onDone }) {
    const [reason, setReason] = useState('Buyer did not receive package');
    const [details, setDetails] = useState('');
    const [error, setError] = useState('');

    const submitFlag = async (e) => {
        e.preventDefault();

        try {
            await API.post('/seller/flagBuyer', {
                buyerId: order.buyerId?._id || order.buyerId,
                orderId: order._id,
                reason: reason,
                details: details
            });

            setDetails('');
            onDone();
        } catch (err) {
            setError(err.response?.data?.message || 'cannot flag buyer');
        }
    };

    return (
        <div className="order-box">
            <h3>Flag buyer</h3>
            {error && <p className="error">{error}</p>}
            <form onSubmit={submitFlag} className="one-column">
                <label>Reason</label>
                <select value={reason} onChange={(e) => setReason(e.target.value)}>
                    <option>Buyer did not receive package</option>
                    <option>Wrong delivery address</option>
                    <option>Buyer unreachable</option>
                    <option>Fake order</option>
                    <option>Repeated cancellation</option>
                </select>

                <label>Details</label>
                <textarea rows="3" value={details} onChange={(e) => setDetails(e.target.value)} />

                <div className="buttons">
                    <button className="btn" type="submit">Submit flag</button>
                    <button className="btn light" type="button" onClick={onDone}>Cancel</button>
                </div>
            </form>
        </div>
    );
}

export default FlagBuyerForm;
