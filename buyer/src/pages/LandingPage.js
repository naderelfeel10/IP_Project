import { useEffect, useState } from 'react';
import { Button, Input, Select } from 'antd';
import { Link, useSearchParams } from 'react-router-dom';
import API from '../api';
import MainNav from '../components/MainNav';
import './Products.css';

const getSellerName = (sellerId, sellersById) => {
    if(!sellerId){
        return 'Unknown seller';
    }

    return sellersById[sellerId] || 'Seller';
};

const groupProductsBySeller = (products, sellersById) => {
    const groups = {};

    products.forEach((product) => {
        const sellerId = getSellerId(product);
        const groupKey = sellerId || 'unknown-seller';

        if(!groups[groupKey]){
            groups[groupKey] = {
                sellerId,
                sellerName: getSellerName(sellerId, sellersById),
                products: []
            };
        }

        groups[groupKey].products.push(product);
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

const ProductImage = ({ product, className = '' }) => {
    if(product.imageUrl){
        return (
            <img
                alt={product.name}
                className={`product-image ${className}`}
                loading="lazy"
                src={product.imageUrl}
            />
        );
    }

    return (
        <div className={`product-image product-image-empty ${className}`} aria-hidden="true">
            <span>{(product.name || 'P').charAt(0).toUpperCase()}</span>
        </div>
    );
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
    const [productsBySeller, setProductsBySeller] = useState({});
    const [selectedSeller, setSelectedSeller] = useState(null);
    const [sellerProducts, setSellerProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sellerLoading, setSellerLoading] = useState(false);
    const [error, setError] = useState('');
    const [sellerError, setSellerError] = useState('');

    useEffect(() => {
        const loadSellers = async () => {
            try {
                const res = await API.get('/seller/getAllSellers');
                const sellersMap = (res.data.result || []).reduce((map, seller) => {
                    map[seller._id] = seller.storeName || seller.username || seller.email || 'Seller';
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
            setSelectedSeller(null);
            setSellerProducts([]);
            setSellerError('');

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
                setProductsBySeller(groupProductsBySeller(result, sellersById));
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to load products');
            } finally {
                setLoading(false);
            }
        };

        loadProducts();
    }, [search, categoryFilter, sellerFilter, priceFromFilter, priceUpToFilter, sellersById]);

    useEffect(() => {
        setFilterValues({
            category: categoryFilter,
            seller: sellerFilter,
            priceFrom: priceFromFilter,
            priceUpTo: priceUpToFilter
        });
    }, [categoryFilter, sellerFilter, priceFromFilter, priceUpToFilter]);

    const sellerGroups = Object.values(productsBySeller);

    const handleViewMore = async (sellerGroup) => {
        setSelectedSeller(sellerGroup);
        setSellerLoading(true);
        setSellerError('');

        try {
            if(!sellerGroup.sellerId){
                setSellerProducts(sellerGroup.products);
                return;
            }

            const res = await API.get('/products', {
                params: { seller: sellerGroup.sellerId }
            });
            setSellerProducts(res.data.result || []);
        } catch (err) {
            setSellerError(err.response?.data?.message || 'Failed to load store products');
        } finally {
            setSellerLoading(false);
        }
    };

    const handleBackToStores = () => {
        setSelectedSeller(null);
        setSellerProducts([]);
        setSellerError('');
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
                <h1>{selectedSeller?.sellerName || (search ? `Search results for "${search}"` : 'Products')}</h1>
            </section>
            <section className="products-content">
                {selectedSeller && (
                    <div className="category-list-view">
                        <div className="category-header">
                            <h2>All {selectedSeller.sellerName} products</h2>
                            <Button onClick={handleBackToStores} type="default">Back</Button>
                        </div>
                        {sellerLoading && <p className="products-message">Loading {selectedSeller.sellerName} products...</p>}
                        {sellerError && <p className="products-message error">{sellerError}</p>}
                        {!sellerLoading && !sellerError && sellerProducts.length === 0 && (
                            <p className="products-message">No products found for this store.</p>
                        )}
                        {!sellerLoading && !sellerError && sellerProducts.length > 0 && (
                            <div className="product-list">
                                {sellerProducts.map((product) => (
                                    <Link className="product-list-item product-clickable" key={product._id} to={`/products/${product._id}`}>
                                            <ProductImage product={product} />
                                            <div className="product-list-details">
                                                <h3>{product.name}</h3>
                                                {renderSellerLink(product)}
                                                <span>{product.deliveryTimeEstimate || 'Delivery time unavailable'} · {formatRating(product.avgRating)}</span>
                                            </div>
                                        <strong>{product.price} EGP</strong>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                )}
                {!selectedSeller && (
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
                                            <ProductImage product={product} />
                                            <div className="product-list-details">
                                                <h3>{product.name}</h3>
                                                {renderSellerLink(product)}
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
                {!loading && !error && !search && sellerGroups.length === 0 && (
                    <p className="products-message">No products found.</p>
                )}
                {!loading && !error && !search && sellerGroups.map((sellerGroup) => (
                    <div className="category-section" key={sellerGroup.sellerId || 'unknown-seller'}>
                        <div className="category-header">
                            <h2>{sellerGroup.sellerName}</h2>
                            <Button onClick={() => handleViewMore(sellerGroup)} type="default">View more</Button>
                        </div>
                        <div className="product-grid">
                            {sellerGroup.products.map((product) => (
                                <Link className="product-card product-clickable" key={product._id} to={`/products/${product._id}`}>
                                    <ProductImage className="product-card-image" product={product} />
                                    <div className="product-card-body">
                                        <h3>{product.name}</h3>
                                        {renderSellerLink(product)}
                                        <div className="product-meta">
                                            <span>{product.deliveryTimeEstimate || 'Delivery time unavailable'}</span>
                                            <strong>{product.price} EGP</strong>
                                        </div>
                                        <div className="product-meta seller-product-meta">
                                            <span>{formatRating(product.avgRating)}</span>
                                        </div>
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
