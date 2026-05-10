const bearerSecurity = [{ bearerAuth: [] }, { cookieAuth: [] }];

const idParam = (name = 'id', description = 'MongoDB ObjectId') => ({
    name,
    in: 'path',
    required: true,
    description,
    schema: { type: 'string' }
});

const jsonBody = (schema, required = true) => ({
    required,
    content: {
        'application/json': { schema }
    }
});

const ref = (name) => ({ $ref: `#/components/schemas/${name}` });

const ok = (description = 'Successful response', schema = ref('SuccessResponse')) => ({
    description,
    content: {
        'application/json': { schema }
    }
});

const created = (description = 'Created', schema = ref('SuccessResponse')) => ok(description, schema);
const badRequest = { description: 'Bad request', content: { 'application/json': { schema: ref('ErrorResponse') } } };
const unauthorized = { description: 'Authentication required or invalid token', content: { 'application/json': { schema: ref('ErrorResponse') } } };
const forbidden = { description: 'Forbidden for this account type or resource owner', content: { 'application/json': { schema: ref('ErrorResponse') } } };
const notFound = { description: 'Resource not found', content: { 'application/json': { schema: ref('ErrorResponse') } } };
const conflict = { description: 'Conflict', content: { 'application/json': { schema: ref('ErrorResponse') } } };
const serverError = { description: 'Server error', content: { 'application/json': { schema: ref('ErrorResponse') } } };

const commonErrors = {
    400: badRequest,
    401: unauthorized,
    403: forbidden,
    404: notFound,
    500: serverError
};

const objectId = { type: 'string', example: '664fb13f7e1c0a1744f4a123' };
const timestamps = {
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' }
};

module.exports = {
    openapi: '3.0.0',
    info: {
        title: 'IP Project API',
        version: '1.0.0',
        description: 'OpenAPI documentation for the IP Project buyer and seller Express API.'
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
                description: 'JWT token sent as: Authorization: Bearer <token>.'
            },
            cookieAuth: {
                type: 'apiKey',
                in: 'cookie',
                name: 'Authorization',
                description: 'JWT cookie value in the format: Bearer <token>.'
            }
        },
        schemas: {
            ErrorResponse: {
                type: 'object',
                properties: {
                    success: { type: 'boolean', example: false },
                    message: { type: 'string' }
                }
            },
            SuccessResponse: {
                type: 'object',
                properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string' },
                    result: {}
                }
            },
            User: {
                type: 'object',
                properties: {
                    _id: objectId,
                    email: { type: 'string', format: 'email' },
                    username: { type: 'string' },
                    type: { type: 'string', enum: ['buyerAccount', 'sellerAccount'] },
                    storeName: { type: 'string' },
                    phone: { type: 'string' },
                    address: { type: 'string' },
                    shippingAddress: { type: 'string' },
                    isActive: { type: 'boolean' },
                    flagCount: { type: 'number' },
                    ...timestamps
                }
            },
            Product: {
                type: 'object',
                properties: {
                    _id: objectId,
                    sellerId: oneOfObjectIdOrUser(),
                    name: { type: 'string' },
                    description: { type: 'string' },
                    imageUrl: { type: 'string' },
                    price: { type: 'number' },
                    category: { type: 'string' },
                    quantity: { type: 'number', minimum: 0 },
                    avgRating: { type: 'number', minimum: 0, maximum: 5 },
                    available: { type: 'boolean' },
                    deliveryTimeEstimate: { type: 'string' },
                    ...timestamps
                }
            },
            ProductInput: {
                type: 'object',
                required: ['name', 'price', 'deliveryTimeEstimate'],
                properties: {
                    name: { type: 'string' },
                    description: { type: 'string' },
                    imageUrl: { type: 'string' },
                    price: { type: 'number', minimum: 0 },
                    category: { type: 'string' },
                    quantity: { type: 'number', minimum: 0, default: 0 },
                    available: { type: 'boolean', default: true },
                    deliveryTimeEstimate: { type: 'string' }
                }
            },
            ProductStatusInput: {
                type: 'object',
                required: ['available'],
                properties: {
                    available: { type: 'boolean' }
                }
            },
            AuthSignupInput: {
                type: 'object',
                required: ['email', 'password', 'username'],
                properties: {
                    email: { type: 'string', format: 'email' },
                    password: { type: 'string', minLength: 8, maxLength: 60 },
                    username: { type: 'string' },
                    type: { type: 'string', enum: ['buyerAccount', 'sellerAccount'], default: 'sellerAccount' },
                    storeName: { type: 'string' },
                    phone: { type: 'string' },
                    address: { type: 'string' }
                }
            },
            AdminSignupInput: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                    email: { type: 'string', format: 'email' },
                    password: { type: 'string', minLength: 8, maxLength: 60 },
                    username: { type: 'string' },
                    setupSecret: { type: 'string', description: 'Optional body alternative to the x-admin-setup-secret header.' }
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
            AuthSigninResponse: {
                type: 'object',
                properties: {
                    success: { type: 'boolean' },
                    token: { type: 'string' },
                    user: ref('User'),
                    message: { type: 'string' }
                }
            },
            ActivateAccountInput: {
                type: 'object',
                required: ['email', 'code'],
                properties: {
                    email: { type: 'string', format: 'email' },
                    code: { type: 'string', description: 'Six digit email verification code.' }
                }
            },
            ResendCodeInput: {
                type: 'object',
                required: ['email'],
                properties: {
                    email: { type: 'string', format: 'email' }
                }
            },
            ChangePasswordInput: {
                type: 'object',
                required: ['currentPassword', 'newPassword'],
                properties: {
                    currentPassword: { type: 'string' },
                    oldPassword: { type: 'string', description: 'Accepted alias for currentPassword.' },
                    password: { type: 'string', description: 'Accepted alias for currentPassword.' },
                    newPassword: { type: 'string', minLength: 8, maxLength: 60 }
                }
            },
            UpdateEmailInput: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                    email: { type: 'string', format: 'email' },
                    password: { type: 'string' }
                }
            },
            DeleteAccountInput: {
                type: 'object',
                properties: {
                    password: { type: 'string', description: 'Optional password confirmation.' }
                }
            },
            CartItem: {
                type: 'object',
                properties: {
                    productId: oneOfObjectIdOrProduct(),
                    quantity: { type: 'number', default: 1, minimum: 1 }
                }
            },
            Cart: {
                type: 'object',
                properties: {
                    _id: objectId,
                    buyerId: objectId,
                    itemsList: {
                        type: 'array',
                        items: ref('CartItem')
                    },
                    totalPrice: { type: 'number' },
                    ...timestamps
                }
            },
            CartInput: {
                type: 'object',
                required: ['productId'],
                properties: {
                    productId: objectId,
                    quantity: { type: 'number', default: 1, minimum: 1 }
                }
            },
            OrderItem: {
                type: 'object',
                required: ['productId', 'quantity'],
                properties: {
                    productId: oneOfObjectIdOrProduct(),
                    quantity: { type: 'number', default: 1, minimum: 1 }
                }
            },
            OrderInput: {
                type: 'object',
                required: ['itemList'],
                properties: {
                    itemList: {
                        type: 'array',
                        items: ref('OrderItem')
                    },
                    itemsList: {
                        type: 'array',
                        description: 'Accepted alias for itemList.',
                        items: ref('OrderItem')
                    },
                    shippingAddress: { type: 'string' },
                    buyerComment: { type: 'string' },
                    orderComment: { type: 'string', description: 'Accepted alias for buyerComment.' },
                    stockAlreadyReserved: { type: 'boolean', default: false }
                }
            },
            OrderStatus: {
                type: 'string',
                enum: ['Pending', 'Accepted', 'Preparing', 'Out for delivery', 'Delivered', 'Cancelled', 'Failed delivery']
            },
            StatusInput: {
                type: 'object',
                required: ['status'],
                properties: {
                    status: ref('OrderStatus')
                }
            },
            Order: {
                type: 'object',
                properties: {
                    _id: objectId,
                    buyerId: oneOfObjectIdOrUser(),
                    itemsList: {
                        type: 'array',
                        items: ref('OrderItem')
                    },
                    totalPrice: { type: 'number' },
                    shippingAddress: { type: 'string' },
                    orderComment: { type: 'string' },
                    buyerComment: { type: 'string' },
                    status: ref('OrderStatus'),
                    statusHistory: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                status: { type: 'string' },
                                date: { type: 'string', format: 'date-time' }
                            }
                        }
                    },
                    ...timestamps
                }
            },
            Review: {
                type: 'object',
                properties: {
                    _id: objectId,
                    productId: objectId,
                    buyerId: objectId,
                    rating: { type: 'number', minimum: 1, maximum: 5 },
                    isFlagged: { type: 'boolean' },
                    commentText: { type: 'string' },
                    ...timestamps
                }
            },
            ReviewInput: {
                type: 'object',
                required: ['productId', 'rating'],
                properties: {
                    productId: objectId,
                    rating: { type: 'number', minimum: 1, maximum: 5 },
                    commentText: { type: 'string' }
                }
            },
            ReviewSummary: {
                type: 'object',
                properties: {
                    productId: objectId,
                    productName: { type: 'string' },
                    reviewCount: { type: 'number' },
                    averageRating: { type: 'number' },
                    summary: { type: 'string' }
                }
            },
            IssueInput: {
                type: 'object',
                required: ['issueScope', 'issueDescription'],
                properties: {
                    issueScope: { type: 'string', enum: ['Order', 'Product', 'Seller'] },
                    issueDescription: { type: 'string' },
                    productId: objectId
                }
            },
            Category: {
                type: 'object',
                properties: {
                    _id: objectId,
                    sellerId: objectId,
                    name: { type: 'string' },
                    ...timestamps
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
            Flag: {
                type: 'object',
                properties: {
                    _id: objectId,
                    userId: objectId,
                    sellerId: objectId,
                    buyerId: objectId,
                    orderId: objectId,
                    productId: objectId,
                    issueScope: { type: 'string', enum: ['Order', 'Product', 'Seller'] },
                    issueDescription: { type: 'string' },
                    status: { type: 'string', enum: ['Open', 'Resolved'] },
                    reason: { type: 'string' },
                    details: { type: 'string' },
                    ...timestamps
                }
            },
            FlagSellerInput: {
                type: 'object',
                properties: {
                    sellerId: objectId,
                    orderId: objectId,
                    productId: objectId,
                    reason: { type: 'string' },
                    details: { type: 'string' }
                }
            },
            FlagBuyerInput: {
                type: 'object',
                properties: {
                    buyerId: objectId,
                    orderId: objectId,
                    reason: { type: 'string' },
                    details: { type: 'string' }
                }
            },
            UserStatusInput: {
                type: 'object',
                required: ['isActive'],
                properties: {
                    isActive: { type: 'boolean' }
                }
            },
            FlagStatusInput: {
                type: 'object',
                required: ['status'],
                properties: {
                    status: { type: 'string', enum: ['Open', 'Resolved'] }
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
        { name: 'Admin' },
        { name: 'Categories' }
    ],
    paths: {
        '/auth/createAccount': {
            post: {
                tags: ['Auth'],
                summary: 'Create a buyer or seller account and email a verification code',
                requestBody: jsonBody(ref('AuthSignupInput')),
                responses: {
                    201: created('Account created'),
                    200: ok('Inactive account already existed and a new code was sent'),
                    401: badRequest,
                    409: conflict,
                    500: serverError
                }
            }
        },
        '/auth/createAdmin': {
            post: {
                tags: ['Auth'],
                summary: 'Create an active admin account using the setup secret',
                parameters: [
                    {
                        name: 'x-admin-setup-secret',
                        in: 'header',
                        required: false,
                        schema: { type: 'string' },
                        description: 'Must match ADMIN_SETUP_SECRET. Can also be sent as setupSecret in the JSON body.'
                    }
                ],
                requestBody: jsonBody(ref('AdminSignupInput')),
                responses: {
                    201: created('Admin account created'),
                    401: badRequest,
                    403: forbidden,
                    409: conflict,
                    500: serverError
                }
            }
        },
        '/auth/signin': {
            post: {
                tags: ['Auth'],
                summary: 'Sign in and return a JWT',
                description: 'Also sets an Authorization cookie. Frontend apps can send the returned token as a Bearer header.',
                requestBody: jsonBody(ref('AuthSigninInput')),
                responses: {
                    200: ok('Signed in successfully', ref('AuthSigninResponse')),
                    401: unauthorized,
                    403: forbidden,
                    500: serverError
                }
            }
        },
        '/auth/logout': {
            post: {
                tags: ['Auth'],
                summary: 'Clear the auth cookie',
                responses: { 200: ok('Logged out') }
            }
        },
        '/auth/activateAccount': {
            patch: {
                tags: ['Auth'],
                summary: 'Activate an account with an emailed verification code',
                requestBody: jsonBody(ref('ActivateAccountInput')),
                responses: { 200: ok('Account activated'), ...commonErrors }
            }
        },
        '/auth/resendCode': {
            post: {
                tags: ['Auth'],
                summary: 'Send a new account activation code',
                requestBody: jsonBody(ref('ResendCodeInput')),
                responses: { 200: ok('Verification code sent'), 400: badRequest, 404: notFound, 500: serverError }
            }
        },
        '/auth/changePassword': {
            patch: {
                tags: ['Auth'],
                summary: 'Change password for the current user',
                security: bearerSecurity,
                requestBody: jsonBody(ref('ChangePasswordInput')),
                responses: { 200: ok('Password changed'), ...commonErrors }
            }
        },
        '/auth/updateEmail': {
            patch: {
                tags: ['Auth'],
                summary: 'Update email for the current user and return a refreshed JWT',
                security: bearerSecurity,
                requestBody: jsonBody(ref('UpdateEmailInput')),
                responses: { 200: ok('Email updated'), 400: badRequest, 401: unauthorized, 404: notFound, 409: conflict, 500: serverError }
            }
        },
        '/auth/deleteAccount': {
            delete: {
                tags: ['Auth'],
                summary: 'Delete the current account',
                security: bearerSecurity,
                requestBody: jsonBody(ref('DeleteAccountInput'), false),
                responses: { 200: ok('Account deleted'), 401: unauthorized, 404: notFound, 500: serverError }
            }
        },

        '/products': {
            get: {
                tags: ['Products'],
                summary: 'Get available products with optional filters',
                parameters: [
                    { name: 'category', in: 'query', schema: { type: 'string' } },
                    { name: 'seller', in: 'query', schema: { type: 'string' } },
                    { name: 'search', in: 'query', schema: { type: 'string' } },
                    { name: 'keyword', in: 'query', schema: { type: 'string' } },
                    { name: 'priceFrom', in: 'query', schema: { type: 'number' } },
                    { name: 'priceUpTo', in: 'query', schema: { type: 'number' } }
                ],
                responses: { 200: ok('Products list'), 400: badRequest, 500: serverError }
            }
        },
        '/products/catalog': { get: { tags: ['Products'], summary: 'Browse available product catalog', responses: { 200: ok('Catalog products'), 500: serverError } } },
        '/products/search': {
            get: {
                tags: ['Products'],
                summary: 'Search available products',
                parameters: [
                    { name: 'keyword', in: 'query', schema: { type: 'string' } },
                    { name: 'search', in: 'query', schema: { type: 'string' } }
                ],
                responses: { 200: ok('Search results'), 500: serverError }
            }
        },
        '/products/categories': { get: { tags: ['Products'], summary: 'Get categories used by available products', responses: { 200: ok('Category names'), 500: serverError } } },
        '/products/categories/{cat_name}': {
            get: {
                tags: ['Products'],
                summary: 'Get available products by category',
                parameters: [idParam('cat_name', 'Category name')],
                responses: { 200: ok('Products in category'), 500: serverError }
            }
        },
        '/products/getProduct/{id}': {
            get: {
                tags: ['Products'],
                summary: 'Get product by id',
                parameters: [idParam()],
                responses: { 200: ok('Product found'), 404: notFound, 500: serverError }
            }
        },
        '/products/getSellerProducts/{id}': {
            get: {
                tags: ['Products'],
                summary: 'Get available public products for a seller',
                parameters: [idParam()],
                responses: { 200: ok('Seller products'), 500: serverError }
            }
        },
        '/products/my-products': {
            get: {
                tags: ['Products'],
                summary: 'Get products owned by the logged-in seller',
                security: bearerSecurity,
                responses: { 200: ok('Seller products'), 401: unauthorized, 403: forbidden, 500: serverError }
            }
        },
        '/products/seller-categories': {
            get: {
                tags: ['Products'],
                summary: 'Get categories used by logged-in seller products',
                security: bearerSecurity,
                responses: { 200: ok('Seller product categories'), 401: unauthorized, 403: forbidden, 500: serverError }
            }
        },
        '/products/addProduct': {
            post: {
                tags: ['Products'],
                summary: 'Add a product as a seller',
                security: bearerSecurity,
                requestBody: jsonBody(ref('ProductInput')),
                responses: { 201: created('Product added'), 401: unauthorized, 403: forbidden, 500: serverError }
            }
        },
        '/products/updateProduct/{id}': {
            put: {
                tags: ['Products'],
                summary: 'Update an owned product',
                security: bearerSecurity,
                parameters: [idParam()],
                requestBody: jsonBody(ref('ProductInput'), false),
                responses: { 200: ok('Product updated'), 401: unauthorized, 403: forbidden, 404: notFound, 500: serverError }
            }
        },
        '/products/removeProduct/{id}': {
            delete: {
                tags: ['Products'],
                summary: 'Delete an owned product',
                security: bearerSecurity,
                parameters: [idParam()],
                responses: { 200: ok('Product deleted'), 401: unauthorized, 403: forbidden, 404: notFound, 500: serverError }
            }
        },
        '/products/{id}/status': {
            patch: {
                tags: ['Products'],
                summary: 'Change owned product availability',
                security: bearerSecurity,
                parameters: [idParam()],
                requestBody: jsonBody(ref('ProductStatusInput')),
                responses: { 200: ok('Product status changed'), 401: unauthorized, 403: forbidden, 404: notFound, 500: serverError }
            }
        },

        '/products/getComment/{id}': { get: { tags: ['Reviews'], summary: 'Get review by id', parameters: [idParam()], responses: { 200: ok('Review found'), 500: serverError } } },
        '/products/myReviews': { get: { tags: ['Reviews'], summary: 'Get reviews written by the logged-in buyer', security: bearerSecurity, responses: { 200: ok('Buyer reviews'), 401: unauthorized, 500: serverError } } },
        '/products/getReviewsByProduct/{productId}': {
            get: {
                tags: ['Reviews'],
                summary: 'Get reviews for a product',
                parameters: [idParam('productId')],
                responses: { 200: ok('Product reviews'), 500: serverError }
            }
        },
        '/products/getReviewSummary/{productId}': {
            get: {
                tags: ['Reviews'],
                summary: 'Get generated review summary for a product',
                parameters: [idParam('productId')],
                responses: { 200: ok('Review summary'), 404: notFound, 500: serverError }
            }
        },
        '/products/addComment': {
            post: {
                tags: ['Reviews'],
                summary: 'Add or replace a product review',
                security: bearerSecurity,
                requestBody: jsonBody(ref('ReviewInput')),
                responses: { 201: created('Review saved'), 400: badRequest, 401: unauthorized, 403: forbidden, 500: serverError }
            }
        },
        '/products/updateComment': {
            put: {
                tags: ['Reviews'],
                summary: 'Add or replace a product review',
                security: bearerSecurity,
                requestBody: jsonBody(ref('ReviewInput')),
                responses: { 201: created('Review saved'), 400: badRequest, 401: unauthorized, 403: forbidden, 500: serverError }
            }
        },
        '/products/removeComment/{id}': { delete: { tags: ['Reviews'], summary: 'Remove a review owned by the current buyer', security: bearerSecurity, parameters: [idParam()], responses: { 200: ok('Review removed'), 401: unauthorized, 404: notFound, 500: serverError } } },

        '/cart/getCart': { get: { tags: ['Cart'], summary: 'Get the current buyer cart', security: bearerSecurity, responses: { 200: ok('Current cart'), 401: unauthorized, 403: forbidden, 500: serverError } } },
        '/cart/addItem': {
            post: {
                tags: ['Cart'],
                summary: 'Add an item to the current buyer cart and reserve stock',
                security: bearerSecurity,
                requestBody: jsonBody(ref('CartInput')),
                responses: { 200: ok('Item added'), ...commonErrors }
            }
        },
        '/cart/decrementItem/{productId}': { patch: { tags: ['Cart'], summary: 'Decrease an item quantity by one and restore stock', security: bearerSecurity, parameters: [idParam('productId')], responses: { 200: ok('Quantity updated'), ...commonErrors } } },
        '/cart/removeItem/{productId}': { delete: { tags: ['Cart'], summary: 'Remove an item from the cart and restore stock', security: bearerSecurity, parameters: [idParam('productId')], responses: { 200: ok('Item removed'), ...commonErrors } } },
        '/cart/clearCart': { delete: { tags: ['Cart'], summary: 'Clear the current buyer cart and restore stock', security: bearerSecurity, responses: { 200: ok('Cart cleared'), 401: unauthorized, 403: forbidden, 500: serverError } } },

        '/orders/addOrder': {
            post: {
                tags: ['Orders'],
                summary: 'Create buyer order(s), split by seller when needed',
                description: 'When the submitted items belong to multiple sellers, the server creates one order per seller.',
                security: bearerSecurity,
                requestBody: jsonBody(ref('OrderInput')),
                responses: { 201: created('Order or orders created'), ...commonErrors }
            }
        },
        '/orders/myOrders': { get: { tags: ['Orders'], summary: 'Get orders for the current buyer or seller', security: bearerSecurity, responses: { 200: ok('Orders list'), 401: unauthorized, 500: serverError } } },
        '/orders/myOrders/{type}': { get: { tags: ['Orders'], summary: 'Get current user orders by status', security: bearerSecurity, parameters: [idParam('type', 'Order status value')], responses: { 200: ok('Filtered orders'), 401: unauthorized, 500: serverError } } },
        '/orders/getAllOrders': { get: { tags: ['Orders'], summary: 'Alias of current user orders', security: bearerSecurity, responses: { 200: ok('Orders list'), 401: unauthorized, 500: serverError } } },
        '/orders/getOrder/{id}': { get: { tags: ['Orders'], summary: 'Get an order by id when visible to the current user', security: bearerSecurity, parameters: [idParam()], responses: { 200: ok('Order found'), ...commonErrors } } },
        '/orders/traceOrder/{id}': { get: { tags: ['Orders'], summary: 'Trace order status/history', security: bearerSecurity, parameters: [idParam()], responses: { 200: ok('Order trace'), 401: unauthorized, 404: notFound, 500: serverError } } },
        '/orders/updateOrder/{id}': {
            put: {
                tags: ['Orders'],
                summary: 'Update buyer order details or seller order status',
                security: bearerSecurity,
                parameters: [idParam()],
                requestBody: jsonBody({ oneOf: [ref('OrderInput'), ref('StatusInput')] }, false),
                responses: { 200: ok('Order updated'), ...commonErrors }
            }
        },
        '/orders/progressOrder/{id}': {
            patch: {
                tags: ['Orders'],
                summary: 'Progress order status as seller',
                description: 'If no status is provided, the controller defaults the order to Delivered.',
                security: bearerSecurity,
                parameters: [idParam()],
                requestBody: jsonBody(ref('StatusInput'), false),
                responses: { 200: ok('Order progressed'), ...commonErrors }
            }
        },
        '/orders/reportIssue/{id}': {
            post: {
                tags: ['Orders'],
                summary: 'Report an issue for an order as a buyer',
                security: bearerSecurity,
                parameters: [idParam()],
                requestBody: jsonBody(ref('IssueInput')),
                responses: { 201: created('Issue reported'), ...commonErrors }
            }
        },
        '/orders/removeOrder/{id}': { delete: { tags: ['Orders'], summary: 'Cancel/delete a pending order as its buyer', security: bearerSecurity, parameters: [idParam()], responses: { 200: ok('Order deleted'), ...commonErrors } } },

        '/buyer/getAllBuyers': { get: { tags: ['Buyer'], summary: 'Get all buyers', responses: { 200: ok('Buyers list'), 500: serverError } } },
        '/buyer/getProfile': { get: { tags: ['Buyer'], summary: 'Get current buyer profile', security: bearerSecurity, responses: { 200: ok('Buyer profile'), 401: unauthorized, 500: serverError } } },
        '/buyer/getPurchaseHistroy': { get: { tags: ['Buyer'], summary: 'Get current buyer purchase history', security: bearerSecurity, responses: { 200: ok('Purchase history'), 401: unauthorized, 403: forbidden, 500: serverError } } },
        '/buyer/flagSeller': {
            patch: {
                tags: ['Buyer'],
                summary: 'Flag a seller as the current buyer',
                security: bearerSecurity,
                requestBody: jsonBody(ref('FlagSellerInput')),
                responses: { 201: created('Seller flagged'), ...commonErrors }
            }
        },

        '/seller/getAllSellers': { get: { tags: ['Seller'], summary: 'Get all sellers', responses: { 200: ok('Sellers list'), 500: serverError } } },
        '/seller/getProfile': { get: { tags: ['Seller'], summary: 'Get current seller profile', security: bearerSecurity, responses: { 200: ok('Seller profile'), 401: unauthorized, 403: forbidden, 404: notFound, 500: serverError } } },
        '/seller/profile': {
            put: {
                tags: ['Seller'],
                summary: 'Update current seller profile',
                security: bearerSecurity,
                requestBody: jsonBody(ref('SellerProfileInput'), false),
                responses: { 200: ok('Seller profile updated'), 401: unauthorized, 403: forbidden, 500: serverError }
            }
        },
        '/seller/getSellerStore': { get: { tags: ['Seller'], summary: 'Get current seller store stats', security: bearerSecurity, responses: { 200: ok('Store stats'), 401: unauthorized, 403: forbidden, 500: serverError } } },
        '/seller/flagBuyer': {
            post: {
                tags: ['Seller'],
                summary: 'Flag a buyer as the current seller',
                security: bearerSecurity,
                requestBody: jsonBody(ref('FlagBuyerInput')),
                responses: { 201: created('Buyer flagged'), 400: badRequest, 401: unauthorized, 403: forbidden, 500: serverError }
            }
        },
        '/seller/flags': { get: { tags: ['Seller'], summary: 'Get flags created by current seller', security: bearerSecurity, responses: { 200: ok('Flags list'), 401: unauthorized, 403: forbidden, 500: serverError } } },

        '/admin/flags': {
            get: {
                tags: ['Admin'],
                summary: 'Get all reports and issue flags',
                security: bearerSecurity,
                responses: { 200: ok('Reports list'), 401: unauthorized, 403: forbidden, 500: serverError }
            }
        },
        '/admin/users/{id}/status': {
            patch: {
                tags: ['Admin'],
                summary: 'Activate or deactivate a user',
                description: 'When a seller is deactivated, all of their products are marked unavailable. Reactivating the seller does not automatically republish products.',
                security: bearerSecurity,
                parameters: [idParam()],
                requestBody: jsonBody(ref('UserStatusInput')),
                responses: { 200: ok('User status updated'), 400: badRequest, 401: unauthorized, 403: forbidden, 404: notFound, 500: serverError }
            }
        },
        '/admin/flags/{id}/status': {
            patch: {
                tags: ['Admin'],
                summary: 'Update a report flag status',
                security: bearerSecurity,
                parameters: [idParam()],
                requestBody: jsonBody(ref('FlagStatusInput')),
                responses: { 200: ok('Flag status updated'), 400: badRequest, 401: unauthorized, 403: forbidden, 404: notFound, 500: serverError }
            }
        },
        '/admin/users/{role}/{id}/flags': {
            get: {
                tags: ['Admin'],
                summary: 'Get an admin user profile with all flags against that user',
                security: bearerSecurity,
                parameters: [
                    {
                        name: 'role',
                        in: 'path',
                        required: true,
                        schema: { type: 'string', enum: ['buyer', 'seller'] }
                    },
                    idParam()
                ],
                responses: { 200: ok('User profile and flags'), 401: unauthorized, 403: forbidden, 404: notFound, 500: serverError }
            }
        },

        '/categories': {
            get: { tags: ['Categories'], summary: 'Get categories owned by the current seller', security: bearerSecurity, responses: { 200: ok('Categories'), 401: unauthorized, 403: forbidden, 500: serverError } },
            post: {
                tags: ['Categories'],
                summary: 'Create a category for the current seller',
                security: bearerSecurity,
                requestBody: jsonBody(ref('CategoryInput')),
                responses: { 201: created('Category created'), 400: badRequest, 401: unauthorized, 403: forbidden, 500: serverError }
            }
        },
        '/categories/{id}': {
            put: {
                tags: ['Categories'],
                summary: 'Update a category owned by the current seller',
                security: bearerSecurity,
                parameters: [idParam()],
                requestBody: jsonBody(ref('CategoryInput')),
                responses: { 200: ok('Category updated'), 401: unauthorized, 403: forbidden, 404: notFound, 500: serverError }
            },
            delete: {
                tags: ['Categories'],
                summary: 'Delete a category owned by the current seller',
                security: bearerSecurity,
                parameters: [idParam()],
                responses: { 200: ok('Category deleted'), 401: unauthorized, 403: forbidden, 404: notFound, 500: serverError }
            }
        }
    }
};

function oneOfObjectIdOrUser() {
    return {
        oneOf: [
            objectId,
            ref('User')
        ]
    };
}

function oneOfObjectIdOrProduct() {
    return {
        oneOf: [
            objectId,
            ref('Product')
        ]
    };
}
