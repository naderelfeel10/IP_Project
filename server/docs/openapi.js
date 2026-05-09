const bearerSecurity = [{ bearerAuth: [] }, { cookieAuth: [] }];

const idParam = (name = 'id') => ({
    name,
    in: 'path',
    required: true,
    schema: { type: 'string' }
});

module.exports = {
    openapi: '3.0.0',
    info: {
        title: 'IP Project API',
        version: '1.0.0',
        description: 'Swagger/OpenAPI documentation for the buyer and seller Express API.'
    },
    servers: [
        {
            url: 'http://localhost:3000',
            description: 'Local server'
        }
    ],
    components: {
        securitySchemes: {
            bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
                description: 'JWT token sent in the Authorization header.'
            },
            cookieAuth: {
                type: 'apiKey',
                in: 'cookie',
                name: 'Authorization',
                description: 'JWT cookie value in the format: Bearer <token>.'
            }
        },
        schemas: {
            AuthSignupInput: {
                type: 'object',
                required: ['email', 'password', 'username', 'type'],
                properties: {
                    email: { type: 'string', format: 'email' },
                    password: { type: 'string' },
                    username: { type: 'string' },
                    type: { type: 'string', enum: ['buyerAccount', 'sellerAccount'] },
                    storeName: { type: 'string' },
                    phone: { type: 'string' },
                    address: { type: 'string' }
                }
            },
            AuthSigninInput: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                    email: { type: 'string', format: 'email' },
                    password: { type: 'string' }
                }
            },
            ProductInput: {
                type: 'object',
                required: ['name', 'description', 'price', 'category', 'deliveryTimeEstimate'],
                properties: {
                    name: { type: 'string' },
                    description: { type: 'string' },
                    imageUrl: { type: 'string' },
                    price: { type: 'number', minimum: 1 },
                    category: { type: 'string', enum: ['PC', 'Electronics', 'Health', 'Games', 'Tools'] },
                    stock: { type: 'number', minimum: 0 },
                    quantity: { type: 'number', minimum: 0 },
                    available: { type: 'boolean' },
                    deliveryTimeEstimate: { type: 'string' }
                }
            },
            Product: {
                allOf: [
                    { $ref: '#/components/schemas/ProductInput' },
                    {
                        type: 'object',
                        properties: {
                            _id: { type: 'string' },
                            sellerId: { type: 'string' },
                            avgRating: { type: 'number' },
                            createdAt: { type: 'string', format: 'date-time' },
                            updatedAt: { type: 'string', format: 'date-time' }
                        }
                    }
                ]
            },
            OrderItem: {
                type: 'object',
                required: ['productId', 'quantity'],
                properties: {
                    productId: { type: 'string' },
                    quantity: { type: 'number', default: 1, minimum: 1 }
                }
            },
            OrderInput: {
                type: 'object',
                required: ['itemList'],
                properties: {
                    itemList: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/OrderItem' }
                    },
                    itemsList: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/OrderItem' }
                    },
                    shippingAddress: { type: 'string' },
                    buyerComment: { type: 'string' },
                    orderComment: { type: 'string' },
                    stockAlreadyReserved: { type: 'boolean' }
                }
            },
            StatusInput: {
                type: 'object',
                required: ['status'],
                properties: {
                    status: {
                        type: 'string',
                        enum: ['Pending', 'Accepted', 'Preparing', 'Out for delivery', 'Shipped', 'Delivered', 'Cancelled', 'Failed delivery']
                    }
                }
            },
            CartInput: {
                type: 'object',
                required: ['productId'],
                properties: {
                    productId: { type: 'string' },
                    quantity: { type: 'number', default: 1, minimum: 1 }
                }
            },
            ReviewInput: {
                type: 'object',
                required: ['productId', 'rating'],
                properties: {
                    productId: { type: 'string' },
                    rating: { type: 'number', minimum: 1, maximum: 5 },
                    commentText: { type: 'string' }
                }
            },
            IssueInput: {
                type: 'object',
                required: ['issueScope', 'issueDescription'],
                properties: {
                    issueScope: { type: 'string', enum: ['Order', 'Product', 'Seller'] },
                    issueDescription: { type: 'string' },
                    productId: { type: 'string' }
                }
            },
            CategoryInput: {
                type: 'object',
                required: ['name'],
                properties: {
                    name: { type: 'string' }
                }
            },
            SellerProfileInput: {
                type: 'object',
                properties: {
                    username: { type: 'string' },
                    storeName: { type: 'string' },
                    phone: { type: 'string' },
                    address: { type: 'string' }
                }
            },
            FlagBuyerInput: {
                type: 'object',
                properties: {
                    buyerId: { type: 'string' },
                    orderId: { type: 'string' },
                    reason: { type: 'string' },
                    details: { type: 'string' }
                }
            },
            SuccessResponse: {
                type: 'object',
                properties: {
                    success: { type: 'boolean' },
                    message: { type: 'string' },
                    result: {}
                }
            }
        }
    },
    tags: [
        { name: 'Auth' },
        { name: 'Products' },
        { name: 'Reviews' },
        { name: 'Cart' },
        { name: 'Orders' },
        { name: 'Buyer' },
        { name: 'Seller' },
        { name: 'Categories' }
    ],
    paths: {
        '/auth/createAccount': {
            post: {
                tags: ['Auth'],
                summary: 'Create a buyer or seller account',
                requestBody: {
                    required: true,
                    content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthSignupInput' } } }
                },
                responses: {
                    201: { description: 'Account created' },
                    401: { description: 'Validation failed or user already exists' }
                }
            }
        },
        '/auth/signin': {
            post: {
                tags: ['Auth'],
                summary: 'Sign in and return a JWT',
                description: 'Also sets an Authorization cookie. Frontend apps usually send the returned token as a Bearer header.',
                requestBody: {
                    required: true,
                    content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthSigninInput' } } }
                },
                responses: {
                    200: { description: 'Signed in successfully' },
                    401: { description: 'Invalid credentials' }
                }
            }
        },
        '/auth/logout': {
            post: {
                tags: ['Auth'],
                summary: 'Clear the auth cookie',
                responses: { 200: { description: 'Logged out' } }
            }
        },
        '/auth/activateAccount': { patch: { tags: ['Auth'], summary: 'Activate account', responses: { 200: { description: 'Route response' } } } },
        '/auth/changePassword': { patch: { tags: ['Auth'], summary: 'Change password', responses: { 200: { description: 'Route response' } } } },
        '/auth/updateEmail': { patch: { tags: ['Auth'], summary: 'Update email', responses: { 200: { description: 'Route response' } } } },
        '/auth/deleteAccount': { delete: { tags: ['Auth'], summary: 'Delete account', responses: { 200: { description: 'Route response' } } } },

        '/products': {
            get: {
                tags: ['Products'],
                summary: 'Get products with optional filters',
                parameters: [
                    { name: 'category', in: 'query', schema: { type: 'string' } },
                    { name: 'seller', in: 'query', schema: { type: 'string' } },
                    { name: 'search', in: 'query', schema: { type: 'string' } },
                    { name: 'priceFrom', in: 'query', schema: { type: 'number' } },
                    { name: 'priceUpTo', in: 'query', schema: { type: 'number' } }
                ],
                responses: { 200: { description: 'Products list' }, 400: { description: 'Invalid filter' } }
            }
        },
        '/products/catalog': { get: { tags: ['Products'], summary: 'Browse catalog', responses: { 200: { description: 'Catalog products' } } } },
        '/products/search': {
            get: {
                tags: ['Products'],
                summary: 'Search products',
                parameters: [
                    { name: 'keyword', in: 'query', schema: { type: 'string' } },
                    { name: 'search', in: 'query', schema: { type: 'string' } }
                ],
                responses: { 200: { description: 'Search results' } }
            }
        },
        '/products/categories': { get: { tags: ['Products'], summary: 'Get product categories', responses: { 200: { description: 'Categories' } } } },
        '/products/categories/{cat_name}': {
            get: {
                tags: ['Products'],
                summary: 'Get products by category',
                parameters: [idParam('cat_name')],
                responses: { 200: { description: 'Products in category' } }
            }
        },
        '/products/getProduct/{id}': {
            get: {
                tags: ['Products'],
                summary: 'Get product by id',
                parameters: [idParam()],
                responses: { 200: { description: 'Product found' }, 404: { description: 'Product not found' } }
            }
        },
        '/products/getSellerProducts/{id}': {
            get: {
                tags: ['Products'],
                summary: 'Get public products for a seller',
                parameters: [idParam()],
                responses: { 200: { description: 'Seller products' } }
            }
        },
        '/products/my-products': {
            get: {
                tags: ['Products'],
                summary: 'Get products owned by logged-in seller',
                security: bearerSecurity,
                responses: { 200: { description: 'Seller products' }, 403: { description: 'Seller only' } }
            }
        },
        '/products/seller-categories': {
            get: {
                tags: ['Products'],
                summary: 'Get categories used by logged-in seller products',
                security: bearerSecurity,
                responses: { 200: { description: 'Seller product categories' } }
            }
        },
        '/products/addProduct': {
            post: {
                tags: ['Products'],
                summary: 'Add product as seller',
                security: bearerSecurity,
                requestBody: {
                    required: true,
                    content: { 'application/json': { schema: { $ref: '#/components/schemas/ProductInput' } } }
                },
                responses: { 201: { description: 'Product added' }, 403: { description: 'Seller only' } }
            }
        },
        '/products/updateProduct/{id}': {
            put: {
                tags: ['Products'],
                summary: 'Update owned product',
                security: bearerSecurity,
                parameters: [idParam()],
                requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/ProductInput' } } } },
                responses: { 200: { description: 'Product updated' }, 404: { description: 'Product not found' } }
            }
        },
        '/products/removeProduct/{id}': {
            delete: {
                tags: ['Products'],
                summary: 'Delete owned product',
                security: bearerSecurity,
                parameters: [idParam()],
                responses: { 200: { description: 'Product deleted' }, 404: { description: 'Product not found' } }
            }
        },
        '/products/{id}/status': {
            patch: {
                tags: ['Products'],
                summary: 'Change owned product availability',
                security: bearerSecurity,
                parameters: [idParam()],
                requestBody: { content: { 'application/json': { schema: { type: 'object', properties: { available: { type: 'boolean' } } } } } },
                responses: { 200: { description: 'Product status changed' } }
            }
        },

        '/products/getComment/{id}': { get: { tags: ['Reviews'], summary: 'Get comment placeholder', parameters: [idParam()], responses: { 200: { description: 'Route response' } } } },
        '/products/myReviews': { get: { tags: ['Reviews'], summary: 'Get reviews written by logged-in buyer', security: bearerSecurity, responses: { 200: { description: 'Buyer reviews' } } } },
        '/products/getReviewsByProduct/{productId}': {
            get: {
                tags: ['Reviews'],
                summary: 'Get reviews for a product',
                parameters: [idParam('productId')],
                responses: { 200: { description: 'Product reviews' } }
            }
        },
        '/products/getReviewSummary/{productId}': {
            get: {
                tags: ['Reviews'],
                summary: 'Generate AI review summary for a product',
                parameters: [idParam('productId')],
                responses: { 200: { description: 'Review summary' }, 404: { description: 'Product not found' } }
            }
        },
        '/products/addComment': {
            post: {
                tags: ['Reviews'],
                summary: 'Add product review',
                security: bearerSecurity,
                requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/ReviewInput' } } } },
                responses: { 201: { description: 'Review added' } }
            }
        },
        '/products/updateComment': {
            put: {
                tags: ['Reviews'],
                summary: 'Update product review',
                security: bearerSecurity,
                requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/ReviewInput' } } } },
                responses: { 200: { description: 'Review updated' } }
            }
        },
        '/products/removeComment/{id}': { delete: { tags: ['Reviews'], summary: 'Remove review', security: bearerSecurity, parameters: [idParam()], responses: { 200: { description: 'Review removed' } } } },

        '/cart/getCart': { get: { tags: ['Cart'], summary: 'Get buyer cart', security: bearerSecurity, responses: { 200: { description: 'Current cart' } } } },
        '/cart/addItem': {
            post: {
                tags: ['Cart'],
                summary: 'Add item to cart',
                security: bearerSecurity,
                requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/CartInput' } } } },
                responses: { 200: { description: 'Item added' } }
            }
        },
        '/cart/decrementItem/{productId}': { patch: { tags: ['Cart'], summary: 'Decrease item quantity by one', security: bearerSecurity, parameters: [idParam('productId')], responses: { 200: { description: 'Quantity updated' } } } },
        '/cart/removeItem/{productId}': { delete: { tags: ['Cart'], summary: 'Remove item from cart', security: bearerSecurity, parameters: [idParam('productId')], responses: { 200: { description: 'Item removed' } } } },
        '/cart/clearCart': { delete: { tags: ['Cart'], summary: 'Clear cart', security: bearerSecurity, responses: { 200: { description: 'Cart cleared' } } } },

        '/orders/addOrder': {
            post: {
                tags: ['Orders'],
                summary: 'Create order',
                security: bearerSecurity,
                requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/OrderInput' } } } },
                responses: { 201: { description: 'Order created' } }
            }
        },
        '/orders/myOrders': { get: { tags: ['Orders'], summary: 'Get orders for current buyer or seller', security: bearerSecurity, responses: { 200: { description: 'Orders list' } } } },
        '/orders/myOrders/{type}': { get: { tags: ['Orders'], summary: 'Get current user orders by status/type', security: bearerSecurity, parameters: [idParam('type')], responses: { 200: { description: 'Filtered orders' } } } },
        '/orders/getAllOrders': { get: { tags: ['Orders'], summary: 'Get all orders visible to current user', security: bearerSecurity, responses: { 200: { description: 'Orders list' } } } },
        '/orders/getOrder/{id}': { get: { tags: ['Orders'], summary: 'Get order by id', security: bearerSecurity, parameters: [idParam()], responses: { 200: { description: 'Order found' } } } },
        '/orders/traceOrder/{id}': { get: { tags: ['Orders'], summary: 'Trace order status/history', security: bearerSecurity, parameters: [idParam()], responses: { 200: { description: 'Order trace' } } } },
        '/orders/updateOrder/{id}': {
            put: {
                tags: ['Orders'],
                summary: 'Update order or seller status',
                security: bearerSecurity,
                parameters: [idParam()],
                requestBody: { content: { 'application/json': { schema: { oneOf: [{ $ref: '#/components/schemas/OrderInput' }, { $ref: '#/components/schemas/StatusInput' }] } } } },
                responses: { 200: { description: 'Order updated' } }
            }
        },
        '/orders/progressOrder/{id}': { patch: { tags: ['Orders'], summary: 'Progress order status as seller', security: bearerSecurity, parameters: [idParam()], responses: { 200: { description: 'Order progressed' } } } },
        '/orders/reportIssue/{id}': {
            post: {
                tags: ['Orders'],
                summary: 'Report issue for order',
                security: bearerSecurity,
                parameters: [idParam()],
                requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/IssueInput' } } } },
                responses: { 201: { description: 'Issue reported' } }
            }
        },
        '/orders/removeOrder/{id}': { delete: { tags: ['Orders'], summary: 'Delete/cancel pending order', security: bearerSecurity, parameters: [idParam()], responses: { 200: { description: 'Order deleted' } } } },

        '/buyer/getAllBuyers': { get: { tags: ['Buyer'], summary: 'Get all buyers', responses: { 200: { description: 'Buyers list' } } } },
        '/buyer/getProfile': { get: { tags: ['Buyer'], summary: 'Get buyer profile', security: bearerSecurity, responses: { 200: { description: 'Buyer profile' } } } },
        '/buyer/getPurchaseHistroy': { get: { tags: ['Buyer'], summary: 'Get buyer purchase history', security: bearerSecurity, responses: { 200: { description: 'Purchase history' } } } },
        '/buyer/flagSeller': { patch: { tags: ['Buyer'], summary: 'Flag seller', security: bearerSecurity, responses: { 200: { description: 'Seller flagged' } } } },

        '/seller/getAllSellers': { get: { tags: ['Seller'], summary: 'Get all sellers', responses: { 200: { description: 'Sellers list' } } } },
        '/seller/getProfile': { get: { tags: ['Seller'], summary: 'Get seller profile', security: bearerSecurity, responses: { 200: { description: 'Seller profile' } } } },
        '/seller/profile': {
            put: {
                tags: ['Seller'],
                summary: 'Update seller profile',
                security: bearerSecurity,
                requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/SellerProfileInput' } } } },
                responses: { 200: { description: 'Seller profile updated' } }
            }
        },
        '/seller/getSellerStore': { get: { tags: ['Seller'], summary: 'Get seller store stats', security: bearerSecurity, responses: { 200: { description: 'Store stats' } } } },
        '/seller/flagBuyer': {
            post: {
                tags: ['Seller'],
                summary: 'Flag buyer',
                security: bearerSecurity,
                requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/FlagBuyerInput' } } } },
                responses: { 201: { description: 'Buyer flagged' } }
            }
        },
        '/seller/flags': { get: { tags: ['Seller'], summary: 'Get flags created by seller', security: bearerSecurity, responses: { 200: { description: 'Flags list' } } } },

        '/categories': {
            get: { tags: ['Categories'], summary: 'Get seller categories', security: bearerSecurity, responses: { 200: { description: 'Categories' } } },
            post: {
                tags: ['Categories'],
                summary: 'Create seller category',
                security: bearerSecurity,
                requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/CategoryInput' } } } },
                responses: { 201: { description: 'Category created' } }
            }
        },
        '/categories/{id}': {
            put: {
                tags: ['Categories'],
                summary: 'Update seller category',
                security: bearerSecurity,
                parameters: [idParam()],
                requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/CategoryInput' } } } },
                responses: { 200: { description: 'Category updated' } }
            },
            delete: {
                tags: ['Categories'],
                summary: 'Delete seller category',
                security: bearerSecurity,
                parameters: [idParam()],
                responses: { 200: { description: 'Category deleted' } }
            }
        }
    }
};
