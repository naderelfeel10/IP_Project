import { useEffect, useState } from 'react';
import API from '../api';
import ProductForm from './ProductForm';

function ProductsPage({ onChange }) {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [categoryFilter, setCategoryFilter] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const loadProducts = async () => {
        try {
            const res = await API.get('/products/my-products');
            setProducts(res.data.products);
        } catch (err) {
            setError(err.response?.data?.message || 'cannot load products');
        }
    };

    const loadCategories = async () => {
        try {
            const res = await API.get('/categories');
            setCategories(res.data.categories);
        } catch (err) {
            console.log(err.message);
        }
    };

    useEffect(() => {
        loadProducts();
        loadCategories();
    }, []);

    const saveProduct = async (form) => {
        try {
            setMessage('');
            setError('');

            if (selectedProduct) {
                await API.put('/products/updateProduct/' + selectedProduct._id, form);
                setMessage('product updated');
            } else {
                await API.post('/products/addProduct', form);
                setMessage('product added');
            }

            setSelectedProduct(null);
            loadProducts();
            onChange();
        } catch (err) {
            setError(err.response?.data?.message || 'cannot save product');
        }
    };

    const deleteProduct = async (id) => {
        try {
            await API.delete('/products/removeProduct/' + id);
            setMessage('product deleted');
            loadProducts();
            onChange();
        } catch (err) {
            setError(err.response?.data?.message || 'cannot delete product');
        }
    };

    const changeStatus = async (product) => {
        try {
            await API.patch('/products/' + product._id + '/status', {
                available: !product.available
            });
            loadProducts();
        } catch (err) {
            setError(err.response?.data?.message || 'cannot change status');
        }
    };

    const shownProducts = categoryFilter
        ? products.filter((product) => product.category === categoryFilter)
        : products;

    return (
        <>
            <ProductForm
                product={selectedProduct}
                categories={categories}
                onSave={saveProduct}
                onCancel={() => setSelectedProduct(null)}
            />

            <div className="section">
                <div className="toolbar">
                    <h2>My products</h2>
                    <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                        <option value="">All categories</option>
                        {categories.map((cat) => (
                            <option key={cat._id} value={cat.name}>{cat.name}</option>
                        ))}
                    </select>
                </div>

                {message && <p className="message">{message}</p>}
                {error && <p className="error">{error}</p>}

                {shownProducts.length === 0 ? (
                    <p className="empty">No products yet.</p>
                ) : (
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Category</th>
                                <th>Price</th>
                                <th>Qty</th>
                                <th>Delivery</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {shownProducts.map((product) => (
                                <tr key={product._id}>
                                    <td>
                                        <strong>{product.name}</strong>
                                        <br />
                                        <small>{product.description}</small>
                                    </td>
                                    <td>{product.category || '-'}</td>
                                    <td>{product.price} EGP</td>
                                    <td>{product.quantity}</td>
                                    <td>{product.deliveryTimeEstimate}</td>
                                    <td>{product.available ? 'Available' : 'Unavailable'}</td>
                                    <td>
                                        <button className="btn small light" onClick={() => setSelectedProduct(product)}>Edit</button>
                                        <button className="btn small light" onClick={() => changeStatus(product)}>Status</button>
                                        <button className="btn small danger" onClick={() => deleteProduct(product._id)}>Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </>
    );
}

export default ProductsPage;
