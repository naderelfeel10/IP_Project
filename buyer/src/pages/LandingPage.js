import { useEffect, useState } from 'react';
import { Button, Input, Select } from 'antd';
import { Link, useSearchParams } from 'react-router-dom';
import API from '../api';
import MainNav from '../components/MainNav';
import './Products.css';

const groupProductsByCategory = (products) => {
    const groups = {};

    products.forEach((product) => {
        const category = product.category || 'Other';

        if(!groups[category]){
            groups[category] = [];
        }

        groups[category].push(product);
    });

    return groups;
};

const getSellerId = (product) => {
    if(!product.sellerId){
        return '';
    }

    return typeof product.sellerId === 'object' ? product.sellerId._id : product.sellerId;
};

const formatRating = (rating) => {
    return rating ? (
        <span className="rating-value"><span aria-hidden="true">★</span> {rating}/5</span>
    ) : 'No rating yet';
};

function LandingPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const search = searchParams.get('search') || '';
    const categoryFilter = searchParams.get('category') || '';
    const sellerFilter = searchParams.get('seller') || '';
    const priceFromFilter = searchParams.get('priceFrom') || '';
    const priceUpToFilter = searchParams.get('priceUpTo') || '';
    const [filterValues, setFilterValues] = useState({
        category: categoryFilter,
        seller: sellerFilter,
        priceFrom: priceFromFilter,
        priceUpTo: priceUpToFilter
    });
    const [categoryOptions, setCategoryOptions] = useState([]);
    const [sellersById, setSellersById] = useState({});
    const [products, setProducts] = useState([]);
    const [productsByCategory, setProductsByCategory] = useState({});
    const [selectedCategory, setSelectedCategory] = useState('');
    const [categoryProducts, setCategoryProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [categoryLoading, setCategoryLoading] = useState(false);
    const [error, setError] = useState('');
    const [categoryError, setCategoryError] = useState('');

    useEffect(() => {
        const loadSellers = async () => {
            try {
                const res = await API.get('/seller/getAllSellers');
                const sellersMap = (res.data.result || []).reduce((map, seller) => {
                    map[seller._id] = seller.username || seller.email || 'Seller';
                    return map;
                }, {});

                setSellersById(sellersMap);
            } catch (err) {
                setSellersById({});
            }
        };

        loadSellers();
    }, []);

    useEffect(() => {
        const loadCategories = async () => {
            try {
                const res = await API.get('/products/categories');
                setCategoryOptions(res.data.result || res.data.categories || []);
            } catch (err) {
                setCategoryOptions([]);
            }
        };

        loadCategories();
    }, []);

    useEffect(() => {
        const loadProducts = async () => {
            setLoading(true);
            setError('');
            setSelectedCategory('');
            setCategoryProducts([]);
            setCategoryError('');

            try {
                const params = {};
                if(search) params.search = search;
                if(categoryFilter) params.category = categoryFilter;
                if(sellerFilter) params.seller = sellerFilter;
                if(priceFromFilter) params.priceFrom = priceFromFilter;
                if(priceUpToFilter) params.priceUpTo = priceUpToFilter;

                const res = await API.get('/products', {
                    params
                });
                const result = res.data.result || [];
                setProducts(result);
                setProductsByCategory(groupProductsByCategory(result));
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to load products');
            } finally {
                setLoading(false);
            }
        };

        loadProducts();
    }, [search, categoryFilter, sellerFilter, priceFromFilter, priceUpToFilter]);

    useEffect(() => {
        setFilterValues({
            category: categoryFilter,
            seller: sellerFilter,
            priceFrom: priceFromFilter,
            priceUpTo: priceUpToFilter
        });
    }, [categoryFilter, sellerFilter, priceFromFilter, priceUpToFilter]);

    const categories = Object.keys(productsByCategory);

    const handleViewMore = async (category) => {
        setSelectedCategory(category);
        setCategoryLoading(true);
        setCategoryError('');

        try {
            const res = await API.get('/products', {
                params: { category }
            });
            setCategoryProducts(res.data.result || []);
        } catch (err) {
            setCategoryError(err.response?.data?.message || 'Failed to load category products');
        } finally {
            setCategoryLoading(false);
        }
    };

    const handleBackToCategories = () => {
        setSelectedCategory('');
        setCategoryProducts([]);
        setCategoryError('');
    };

    const updateFilter = (name, value) => {
        setFilterValues((current) => ({
            ...current,
            [name]: value
        }));
    };

    const applyFilters = (overrides = {}) => {
        const nextFilters = {
            ...filterValues,
            ...overrides
        };
        const nextParams = {};
        if(search) nextParams.search = search;
        if(nextFilters.category) nextParams.category = nextFilters.category;
        if(nextFilters.seller.trim()) nextParams.seller = nextFilters.seller.trim();
        if(nextFilters.priceFrom) nextParams.priceFrom = nextFilters.priceFrom;
        if(nextFilters.priceUpTo) nextParams.priceUpTo = nextFilters.priceUpTo;

        setSearchParams(nextParams);
    };

    const clearFilters = () => {
        setFilterValues({
            category: '',
            seller: '',
            priceFrom: '',
            priceUpTo: ''
        });
        setSearchParams(search ? { search } : {});
    };

    const renderSellerLink = (product) => {
        const sellerId = getSellerId(product);

        if(!sellerId){
            return <span className="seller-link muted">Unknown seller</span>;
        }

        return (
            <Link className="seller-link" onClick={(event) => event.stopPropagation()} to={`/seller/${sellerId}`}>
                {sellersById[sellerId] || 'Seller'}
            </Link>
        );
    };

    return (
        <main className="page-shell">
            <MainNav />
            <section className="page-header">
                <h1>{selectedCategory || (search ? `Search results for "${search}"` : 'Products')}</h1>
            </section>
            <section className="products-content">
                {selectedCategory && (
                    <div className="category-list-view">
                        <div className="category-header">
                            <h2>All {selectedCategory} products</h2>
                            <Button onClick={handleBackToCategories} type="default">Back</Button>
                        </div>
                        {categoryLoading && <p className="products-message">Loading {selectedCategory} products...</p>}
                        {categoryError && <p className="products-message error">{categoryError}</p>}
                        {!categoryLoading && !categoryError && categoryProducts.length === 0 && (
                            <p className="products-message">No products found in this category.</p>
                        )}
                        {!categoryLoading && !categoryError && categoryProducts.length > 0 && (
                            <div className="product-list">
                                {categoryProducts.map((product) => (
                                    <Link className="product-list-item product-clickable" key={product._id} to={`/products/${product._id}`}>
                                            <div>
                                                <h3>{product.name}</h3>
                                                {renderSellerLink(product)}
                                                <p>{product.description || 'No description available.'}</p>
                                                <span>{product.deliveryTimeEstimate || 'Delivery time unavailable'} · {formatRating(product.avgRating)}</span>
                                            </div>
                                        <strong>{product.price} EGP</strong>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                )}
                {!selectedCategory && (
                    <>
                {!search && loading && <p className="products-message">Loading products...</p>}
                {!search && error && <p className="products-message error">{error}</p>}
                {search && (
                    <div className="search-results-layout">
                        <aside className="filters-panel">
                            <h2>Filters</h2>
                            <label>
                                Category
                                <Select
                                    allowClear
                                    onChange={(value) => {
                                        const category = value || '';
                                        updateFilter('category', category);
                                        applyFilters({ category });
                                    }}
                                    options={categoryOptions.map((category) => ({ label: category, value: category }))}
                                    placeholder="Any category"
                                    value={filterValues.category || undefined}
                                />
                            </label>
                            <label>
                                Seller
                                <Select
                                    allowClear
                                    onChange={(value) => {
                                        const seller = value || '';
                                        updateFilter('seller', seller);
                                        applyFilters({ seller });
                                    }}
                                    options={Object.entries(sellersById).map(([sellerId, sellerName]) => ({
                                        label: sellerName,
                                        value: sellerId
                                    }))}
                                    placeholder="Any seller"
                                    showSearch
                                    optionFilterProp="label"
                                    value={filterValues.seller || undefined}
                                />
                            </label>
                            <label>
                                Price from
                                <Input
                                    min="0"
                                    onChange={(e) => updateFilter('priceFrom', e.target.value)}
                                    onPressEnter={() => applyFilters()}
                                    placeholder="Min price"
                                    type="number"
                                    value={filterValues.priceFrom}
                                />
                            </label>
                            <label>
                                Price up to
                                <Input
                                    min="0"
                                    onChange={(e) => updateFilter('priceUpTo', e.target.value)}
                                    onPressEnter={() => applyFilters()}
                                    placeholder="Max price"
                                    type="number"
                                    value={filterValues.priceUpTo}
                                />
                            </label>
                            <Button block onClick={clearFilters} type="default">Clear filters</Button>
                        </aside>
                        <div className="search-results-list">
                            {loading && <p className="products-message">Loading products...</p>}
                            {error && <p className="products-message error">{error}</p>}
                            {!loading && !error && products.length === 0 && (
                                <p className="products-message">No products matched your search.</p>
                            )}
                            {!loading && !error && products.length > 0 && (
                                <div className="product-list">
                                    {products.map((product) => (
                                        <Link className="product-list-item product-clickable" key={product._id} to={`/products/${product._id}`}>
                                            <div>
                                                <h3>{product.name}</h3>
                                                {renderSellerLink(product)}
                                                <p>{product.description || 'No description available.'}</p>
                                                <span>{product.category || 'Other'} · {product.deliveryTimeEstimate || 'Delivery time unavailable'} · {formatRating(product.avgRating)}</span>
                                            </div>
                                            <strong>{product.price} EGP</strong>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
                {!loading && !error && !search && categories.length === 0 && (
                    <p className="products-message">No products found.</p>
                )}
                {!loading && !error && !search && categories.map((category) => (
                    <div className="category-section" key={category}>
                        <div className="category-header">
                            <h2>{category}</h2>
                            <Button onClick={() => handleViewMore(category)} type="default">View more</Button>
                        </div>
                        <div className="product-grid">
                            {productsByCategory[category].map((product) => (
                                <Link className="product-card product-clickable" key={product._id} to={`/products/${product._id}`}>
                                    <h3>{product.name}</h3>
                                    {renderSellerLink(product)}
                                    <p>{product.description || 'No description available.'}</p>
                                    <div className="product-meta">
                                        <span>{product.deliveryTimeEstimate || 'Delivery time unavailable'}</span>
                                        <strong>{product.price} EGP</strong>
                                    </div>
                                    <div className="product-meta seller-product-meta">
                                        <span>{formatRating(product.avgRating)}</span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                ))}
                    </>
                )}
            </section>
        </main>
    );
}

export default LandingPage;
