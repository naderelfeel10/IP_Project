import { useEffect, useState } from 'react';

const emptyProduct = {
    name: '',
    description: '',
    imageUrl: '',
    price: '',
    category: '',
    quantity: '',
    deliveryTimeEstimate: '',
    available: true
};

function ProductForm({ product, categories, onSave, onCancel }) {
    const [form, setForm] = useState(emptyProduct);

    useEffect(() => {
        if (product) {
            setForm({
                name: product.name || '',
                description: product.description || '',
                imageUrl: product.imageUrl || '',
                price: product.price || '',
                category: product.category || '',
                quantity: product.quantity || '',
                deliveryTimeEstimate: product.deliveryTimeEstimate || '',
                available: product.available
            });
        } else {
            setForm(emptyProduct);
        }
    }, [product]);

    const changeInput = (e) => {
        const name = e.target.name;
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setForm({ ...form, [name]: value });
    };

    const submitForm = (e) => {
        e.preventDefault();
        onSave(form);
    };

    return (
        <div className="section">
            <h2>{product ? 'Edit product' : 'Add product'}</h2>
            <form onSubmit={submitForm}>
                <div className="form-grid">
                    <div>
                        <label>Name</label>
                        <input name="name" value={form.name} onChange={changeInput} required />
                    </div>
                    <div>
                        <label>Price</label>
                        <input name="price" type="number" min="0" value={form.price} onChange={changeInput} required />
                    </div>
                    <div>
                        <label>Quantity</label>
                        <input name="quantity" type="number" min="0" value={form.quantity} onChange={changeInput} />
                    </div>
                    <div>
                        <label>Category</label>
                        <select name="category" value={form.category} onChange={changeInput}>
                            <option value="">No category</option>
                            {categories.map((cat) => (
                                <option key={cat._id} value={cat.name}>{cat.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label>Delivery time estimate</label>
                        <input name="deliveryTimeEstimate" value={form.deliveryTimeEstimate} onChange={changeInput} placeholder="2 days" required />
                    </div>
                    <div>
                        <label>Image URL</label>
                        <input name="imageUrl" value={form.imageUrl} onChange={changeInput} placeholder="https://..." />
                    </div>
                    <div className="wide">
                        <label>Description</label>
                        <textarea name="description" value={form.description} onChange={changeInput} rows="3" />
                    </div>
                    <div className="check-row">
                        <input name="available" type="checkbox" checked={form.available} onChange={changeInput} />
                        <span>Available for buyers</span>
                    </div>
                </div>

                <div className="buttons">
                    <button className="btn" type="submit">{product ? 'Save product' : 'Add product'}</button>
                    {product && <button className="btn light" type="button" onClick={onCancel}>Cancel edit</button>}
                </div>
            </form>
        </div>
    );
}

export default ProductForm;
