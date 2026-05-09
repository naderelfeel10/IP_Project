import { useEffect, useState } from 'react';
import API from '../api';

function CategoriesPage({ onChange }) {
    const [categories, setCategories] = useState([]);
    const [name, setName] = useState('');
    const [editId, setEditId] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const loadCategories = async () => {
        try {
            const res = await API.get('/categories');
            setCategories(res.data.categories);
        } catch (err) {
            setError(err.response?.data?.message || 'cannot load categories');
        }
    };

    useEffect(() => {
        loadCategories();
    }, []);

    const submitCategory = async (e) => {
        e.preventDefault();

        try {
            setMessage('');
            setError('');

            if (editId) {
                await API.put('/categories/' + editId, { name: name });
                setMessage('category updated');
            } else {
                await API.post('/categories', { name: name });
                setMessage('category added');
            }

            setName('');
            setEditId('');
            loadCategories();
            onChange();
        } catch (err) {
            setError(err.response?.data?.message || 'cannot save category');
        }
    };

    const editCategory = (category) => {
        setEditId(category._id);
        setName(category.name);
    };

    const deleteCategory = async (id) => {
        try {
            await API.delete('/categories/' + id);
            setMessage('category deleted');
            loadCategories();
            onChange();
        } catch (err) {
            setError(err.response?.data?.message || 'cannot delete category');
        }
    };

    return (
        <div className="section">
            <h2>Categories</h2>
            <form onSubmit={submitCategory} className="one-column">
                {message && <p className="message">{message}</p>}
                {error && <p className="error">{error}</p>}
                <label>Category name</label>
                <input value={name} onChange={(e) => setName(e.target.value)} required />
                <div className="buttons">
                    <button className="btn" type="submit">{editId ? 'Save category' : 'Add category'}</button>
                    {editId && <button className="btn light" type="button" onClick={() => { setEditId(''); setName(''); }}>Cancel</button>}
                </div>
            </form>

            {categories.length === 0 ? (
                <p className="empty">No categories yet.</p>
            ) : (
                <table className="table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {categories.map((category) => (
                            <tr key={category._id}>
                                <td>{category.name}</td>
                                <td>
                                    <button className="btn small light" onClick={() => editCategory(category)}>Edit</button>
                                    <button className="btn small danger" onClick={() => deleteCategory(category._id)}>Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default CategoriesPage;
