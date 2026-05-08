module.exports = {
    openapi: "3.0.0",
    info: {
        title: "IP Project API",
        version: "1.0.0",
        description: "Swagger/OpenAPI documentation for the existing Express endpoints."
    },
    servers: [
        {
            url: "http://localhost:3000",
            description: "Local server"
        }
    ],
    components: {
        securitySchemes: {
            cookieAuth: {
                type: "apiKey",
                in: "cookie",
                name: "Authorization",
                description: "JWT cookie value in the format: Bearer <token>"
            }
        },
        schemas: {
            Product: {
                type: "object",
                properties: {
                    _id: { type: "string" },
                    sellerId: { type: "string" },
                    name: { type: "string" },
                    description: { type: "string" },
                    price: { type: "number" },
                    category: {
                        type: "string",
                        enum: ["PC", "Electronics", "Health", "Games", "Tools"]
                    },
                    stock: { type: "number" },
                    avgRating: { type: "number" },
                    deliveryTimeEstimate: { type: "string" },
                    createdAt: { type: "string", format: "date-time" },
                    updatedAt: { type: "string", format: "date-time" }
                }
            },
            ProductInput: {
                type: "object",
                required: ["name", "description", "price", "category", "deliveryTimeEstimate"],
                properties: {
                    name: { type: "string" },
                    description: { type: "string" },
                    price: { type: "number", minimum: 1 },
                    category: {
                        type: "string",
                        enum: ["PC", "Electronics", "Health", "Games", "Tools"]
                    },
                    deliveryTimeEstimate: { type: "string" }
                }
            },
            OrderItem: {
                type: "object",
                required: ["productId", "quantity"],
                properties: {
                    productId: { type: "string" },
                    quantity: { type: "number", default: 1 }
                }
            },
            OrderInput: {
                type: "object",
                required: ["itemList"],
                properties: {
                    itemList: {
                        type: "array",
                        items: { $ref: "#/components/schemas/OrderItem" }
                    },
                    shippingAddress: { type: "string" },
                    buyerComment: { type: "string" },
                    stockAlreadyReserved: { type: "boolean" }
                }
            },
            Order: {
                type: "object",
                properties: {
                    _id: { type: "string" },
                    buyerId: { type: "string" },
                    itemsList: {
                        type: "array",
                        items: { $ref: "#/components/schemas/OrderItem" }
                    },
                    totalPrice: { type: "number" },
                    shippingAddress: { type: "string" },
                    buyerComment: { type: "string" },
                    status: { type: "string", enum: ["Pending", "Shipped", "Delivered", "Cancelled"] },
                    createdAt: { type: "string", format: "date-time" },
                    updatedAt: { type: "string", format: "date-time" }
                }
            },
            FlagInput: {
                type: "object",
                required: ["issueScope", "issueDescription"],
                properties: {
                    issueScope: { type: "string", enum: ["Order", "Product", "Seller"] },
                    issueDescription: { type: "string" },
                    productId: { type: "string" }
                }
            },
            Flag: {
                type: "object",
                properties: {
                    _id: { type: "string" },
                    userId: { type: "string" },
                    orderId: { type: "string" },
                    productId: { type: "string" },
                    sellerId: { type: "string" },
                    issueScope: { type: "string", enum: ["Order", "Product", "Seller"] },
                    issueDescription: { type: "string" },
                    status: { type: "string", enum: ["Open", "Resolved"] },
                    createdAt: { type: "string", format: "date-time" },
                    updatedAt: { type: "string", format: "date-time" }
                }
            },
            CartInput: {
                type: "object",
                required: ["productId", "quantity"],
                properties: {
                    productId: { type: "string" },
                    quantity: { type: "number", default: 1, minimum: 1 }
                }
            },
            Cart: {
                type: "object",
                properties: {
                    _id: { type: "string" },
                    buyerId: { type: "string" },
                    itemsList: {
                        type: "array",
                        items: { $ref: "#/components/schemas/OrderItem" }
                    },
                    totalPrice: { type: "number" },
                    createdAt: { type: "string", format: "date-time" },
                    updatedAt: { type: "string", format: "date-time" }
                }
            },
            ReviewInput: {
                type: "object",
                required: ["productId", "rating"],
                properties: {
                    productId: { type: "string" },
                    rating: { type: "number", minimum: 1, maximum: 5 },
                    commentText: { type: "string" }
                }
            },
            AuthSignupInput: {
                type: "object",
                required: ["email", "password", "username", "type"],
                properties: {
                    email: { type: "string", format: "email" },
                    password: { type: "string" },
                    username: { type: "string" },
                    type: {
                        type: "string",
                        enum: ["buyerAccount", "sellerAccount"]
                    }
                }
            },
            AuthSigninInput: {
                type: "object",
                required: ["email", "password"],
                properties: {
                    email: { type: "string", format: "email" },
                    password: { type: "string" }
                }
            },
            SuccessResponse: {
                type: "object",
                properties: {
                    success: { type: "boolean" },
                    message: { type: "string" }
                }
            }
        }
    },
    tags: [
        { name: "Auth" },
        { name: "Products" },
        { name: "Orders" },
        { name: "Reviews" },
        { name: "Cart" },
        { name: "Buyer" },
        { name: "Seller" }
    ],
    paths: {
        "/auth/createAccount": {
            post: {
                tags: ["Auth"],
                summary: "Create a buyer or seller account",
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: { $ref: "#/components/schemas/AuthSignupInput" }
                        }
                    }
                },
                responses: {
                    200: { description: "Account created" },
                    401: { description: "Validation failed or user already exists" }
                }
            }
        },
        "/auth/signin": {
            post: {
                tags: ["Auth"],
                summary: "Sign in and set the Authorization cookie",
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: { $ref: "#/components/schemas/AuthSigninInput" }
                        }
                    }
                },
                responses: {
                    200: { description: "Signed in successfully" },
                    401: { description: "Invalid credentials" }
                }
            }
        },
        "/auth/sginin": {
            post: {
                tags: ["Auth"],
                summary: "Sign in and set the Authorization cookie",
                description: "Legacy misspelled route kept for compatibility. Prefer /auth/signin.",
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: { $ref: "#/components/schemas/AuthSigninInput" }
                        }
                    }
                },
                responses: {
                    200: { description: "Signed in successfully" },
                    401: { description: "Invalid credentials" }
                }
            }
        },
        "/auth/activateAccount": {
            patch: {
                tags: ["Auth"],
                summary: "Activate account",
                description: "Endpoint exists, but the controller is currently empty.",
                responses: { 501: { description: "Not implemented" } }
            }
        },
        "/auth/changePasword": {
            patch: {
                tags: ["Auth"],
                summary: "Change password",
                description: "Endpoint exists, but the controller is currently empty. The route name is currently spelled /changePasword.",
                responses: { 501: { description: "Not implemented" } }
            }
        },
        "/auth/updateEmail": {
            patch: {
                tags: ["Auth"],
                summary: "Update email",
                description: "Endpoint exists, but the controller is currently empty.",
                responses: { 501: { description: "Not implemented" } }
            }
        },
        "/auth/deleteAccount": {
            delete: {
                tags: ["Auth"],
                summary: "Delete account",
                description: "Endpoint exists, but the controller is currently empty.",
                responses: { 501: { description: "Not implemented" } }
            }
        },
        "/products": {
            get: {
                tags: ["Products"],
                summary: "Get products with optional filters",
                parameters: [
                    { name: "category", in: "query", schema: { type: "string", enum: ["PC", "Electronics", "Health", "Games", "Tools"] } },
                    { name: "seller", in: "query", schema: { type: "string" } },
                    { name: "search", in: "query", schema: { type: "string" } },
                    { name: "priceFrom", in: "query", schema: { type: "number", minimum: 0 } },
                    { name: "priceUpTo", in: "query", schema: { type: "number", minimum: 0 } }
                ],
                responses: {
                    200: { description: "Filtered products" },
                    400: { description: "Invalid filter value" }
                }
            }
        },
        "/products/addProduct/": {
            post: {
                tags: ["Products"],
                summary: "Add a new product",
                security: [{ cookieAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: { $ref: "#/components/schemas/ProductInput" }
                        }
                    }
                },
                responses: {
                    201: { description: "Product added" },
                    401: { description: "Unauthorized, invalid fields, or buyer account" }
                }
            }
        },
        "/products/getProduct/{id}": {
            get: {
                tags: ["Products"],
                summary: "Get one product by id",
                parameters: [
                    { name: "id", in: "path", required: true, schema: { type: "string" } }
                ],
                responses: { 200: { description: "Product found" } }
            }
        },
        "/products/updateProduct/{id}": {
            put: {
                tags: ["Products"],
                summary: "Update a product owned by the logged-in seller",
                security: [{ cookieAuth: [] }],
                parameters: [
                    { name: "id", in: "path", required: true, schema: { type: "string" } }
                ],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: { $ref: "#/components/schemas/ProductInput" }
                        }
                    }
                },
                responses: {
                    200: { description: "Product updated" },
                    401: { description: "Unauthorized or not product owner" },
                    404: { description: "Product not found" }
                }
            }
        },
        "/products/removeProduct/{id}": {
            delete: {
                tags: ["Products"],
                summary: "Delete a product owned by the logged-in seller",
                security: [{ cookieAuth: [] }],
                parameters: [
                    { name: "id", in: "path", required: true, schema: { type: "string" } }
                ],
                responses: {
                    201: { description: "Product deleted" },
                    401: { description: "Unauthorized or not product owner" }
                }
            }
        },
        "/products/search": {
            get: {
                tags: ["Products"],
                summary: "Search products",
                description: "Endpoint exists, but the controller is currently empty.",
                responses: { 501: { description: "Not implemented" } }
            }
        },
        "/products/catalog": {
            get: {
                tags: ["Products"],
                summary: "Browse product catalog",
                description: "Returns product _id, name, price, and category.",
                responses: { 200: { description: "Product catalog" } }
            }
        },
        "/products/categories": {
            get: {
                tags: ["Products"],
                summary: "Get all product categories",
                responses: { 200: { description: "Categories list" } }
            }
        },
        "/products/categories/{cat_name}": {
            get: {
                tags: ["Products"],
                summary: "Get products by category",
                parameters: [
                    { name: "cat_name", in: "path", required: true, schema: { type: "string", enum: ["PC", "Electronics", "Health", "Games", "Tools"] } }
                ],
                responses: { 200: { description: "Products in category" } }
            }
        },
        "/products/my-products/": {
            get: {
                tags: ["Products"],
                summary: "Get products owned by logged-in seller",
                security: [{ cookieAuth: [] }],
                responses: {
                    200: { description: "Seller products" },
                    401: { description: "User is not a seller" }
                }
            }
        },
        "/products/getSellerProducts/{id}": {
            get: {
                tags: ["Products"],
                summary: "Get all products for a seller",
                parameters: [
                    { name: "id", in: "path", required: true, schema: { type: "string" } }
                ],
                responses: { 200: { description: "Seller products" } }
            }
        },
        "/orders/getOrder/{id}": {
            get: {
                tags: ["Orders"],
                summary: "Get one order for the logged-in buyer",
                security: [{ cookieAuth: [] }],
                parameters: [
                    { name: "id", in: "path", required: true, schema: { type: "string" } }
                ],
                responses: {
                    200: { description: "Order found" },
                    403: { description: "Not a buyer or not order owner" }
                }
            }
        },
        "/orders/addOrder/": {
            post: {
                tags: ["Orders"],
                summary: "Create a new order",
                security: [{ cookieAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: { $ref: "#/components/schemas/OrderInput" }
                        }
                    }
                },
                responses: {
                    201: { description: "Order added" },
                    400: { description: "Insufficient stock" },
                    403: { description: "User must be a buyer" },
                    404: { description: "Product not found" }
                }
            }
        },
        "/orders/updateOrder/{id}": {
            put: {
                tags: ["Orders"],
                summary: "Update a pending order",
                security: [{ cookieAuth: [] }],
                parameters: [
                    { name: "id", in: "path", required: true, schema: { type: "string" } }
                ],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: { $ref: "#/components/schemas/OrderInput" }
                        }
                    }
                },
                responses: {
                    200: { description: "Order updated" },
                    400: { description: "Order already processed or insufficient stock" },
                    403: { description: "Unauthorized" },
                    404: { description: "Order or product not found" }
                }
            }
        },
        "/orders/progressOrder/{id}": {
            patch: {
                tags: ["Orders"],
                summary: "Progress an order to the next status",
                description: "Moves Pending to Shipped, and Shipped to Delivered. Delivered and Cancelled orders cannot progress.",
                security: [{ cookieAuth: [] }],
                parameters: [
                    { name: "id", in: "path", required: true, schema: { type: "string" } }
                ],
                responses: {
                    200: { description: "Order status progressed" },
                    400: { description: "Order cannot progress from current status" },
                    403: { description: "Not a buyer or not order owner" },
                    404: { description: "Order not found" }
                }
            }
        },
        "/orders/reportIssue/{id}": {
            post: {
                tags: ["Orders"],
                summary: "Report an issue for an order",
                description: "Creates a flag for an admin to review. The issue can describe the whole order, a specific product, or the seller connected to a selected product.",
                security: [{ cookieAuth: [] }],
                parameters: [
                    { name: "id", in: "path", required: true, schema: { type: "string" } }
                ],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: { $ref: "#/components/schemas/FlagInput" }
                        }
                    }
                },
                responses: {
                    201: { description: "Issue reported" },
                    400: { description: "Invalid issue details" },
                    403: { description: "Not a buyer or not order owner" },
                    404: { description: "Order not found" }
                }
            }
        },
        "/orders/removeOrder/{id}": {
            delete: {
                tags: ["Orders"],
                summary: "Delete an order owned by the logged-in buyer",
                security: [{ cookieAuth: [] }],
                parameters: [
                    { name: "id", in: "path", required: true, schema: { type: "string" } }
                ],
                responses: {
                    201: { description: "Order deleted" },
                    403: { description: "Not a buyer or not order owner" }
                }
            }
        },
        "/orders/traceOrder/{id}": {
            get: {
                tags: ["Orders"],
                summary: "Trace order status and details",
                security: [{ cookieAuth: [] }],
                parameters: [
                    { name: "id", in: "path", required: true, schema: { type: "string" } }
                ],
                responses: {
                    200: { description: "Order trace details" },
                    403: { description: "Unauthorized" },
                    404: { description: "Order not found" }
                }
            }
        },
        "/orders/myOrders/": {
            get: {
                tags: ["Orders"],
                summary: "Get all orders for the logged-in buyer",
                security: [{ cookieAuth: [] }],
                responses: {
                    200: { description: "Buyer orders" },
                    403: { description: "User must be a buyer" }
                }
            }
        },
        "/orders/getAllOrders/": {
            get: {
                tags: ["Orders"],
                summary: "Get all orders for the logged-in buyer",
                description: "Returns the logged-in buyer's orders with product details populated.",
                security: [{ cookieAuth: [] }],
                responses: {
                    200: { description: "Buyer orders" },
                    403: { description: "User must be a buyer" }
                }
            }
        },
        "/orders/myOrders/{status}/": {
            get: {
                tags: ["Orders"],
                summary: "Get buyer orders by status",
                security: [{ cookieAuth: [] }],
                parameters: [
                    { name: "status", in: "path", required: true, schema: { type: "string", enum: ["Pending", "Shipped", "Delivered", "Cancelled"] } }
                ],
                responses: {
                    200: { description: "Orders filtered by status" },
                    403: { description: "User must be a buyer" }
                }
            }
        },
        "/products/getComment/{id}": {
            get: {
                tags: ["Reviews"],
                summary: "Get comment/review",
                description: "Endpoint exists, but the controller is currently empty.",
                parameters: [
                    { name: "id", in: "path", required: true, schema: { type: "string" } }
                ],
                responses: { 501: { description: "Not implemented" } }
            }
        },
        "/products/getReviewsByProduct/{productId}": {
            get: {
                tags: ["Reviews"],
                summary: "Get reviews for a product",
                parameters: [
                    { name: "productId", in: "path", required: true, schema: { type: "string" } }
                ],
                responses: {
                    200: { description: "Product reviews" },
                    500: { description: "Server error" }
                }
            }
        },
        "/products/myReviews": {
            get: {
                tags: ["Reviews"],
                summary: "Get reviews written by the logged-in buyer",
                security: [{ cookieAuth: [] }],
                responses: {
                    200: { description: "Buyer reviews" },
                    403: { description: "User must be a buyer" },
                    500: { description: "Server error" }
                }
            }
        },
        "/products/getReviewSummary/{productId}": {
            get: {
                tags: ["Reviews"],
                summary: "Summarize reviews for a product with Google GenAI",
                description: "Fetches product reviews and sends them to Google GenAI. Requires GEMINI_API_KEY or GOOGLE_API_KEY in the server environment.",
                parameters: [
                    { name: "productId", in: "path", required: true, schema: { type: "string" } }
                ],
                responses: {
                    200: { description: "AI review summary" },
                    400: { description: "Invalid product id" },
                    404: { description: "Product not found" },
                    500: { description: "Server error or missing Google API key" }
                }
            }
        },
        "/products/addComment/": {
            post: {
                tags: ["Reviews"],
                summary: "Add comment/review",
                description: "Creates a review for the logged-in buyer and recalculates the product average rating. The buyer must have a delivered order containing the product.",
                security: [{ cookieAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: { $ref: "#/components/schemas/ReviewInput" }
                        }
                    }
                },
                responses: {
                    201: { description: "Review added" },
                    400: { description: "Missing or invalid review data" },
                    403: { description: "User must be a buyer or product is not in a delivered order" },
                    404: { description: "Product not found" },
                    500: { description: "Server error" }
                }
            }
        },
        "/products/updateComment/": {
            put: {
                tags: ["Reviews"],
                summary: "Update comment/review",
                description: "Updates the logged-in buyer's review for a delivered product.",
                security: [{ cookieAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: { $ref: "#/components/schemas/ReviewInput" }
                        }
                    }
                },
                responses: {
                    200: { description: "Review updated" },
                    400: { description: "Missing or invalid review data" },
                    403: { description: "User must be a buyer or product is not in a delivered order" },
                    404: { description: "Review or product not found" },
                    500: { description: "Server error" }
                }
            }
        },
        "/products/removeComment/": {
            delete: {
                tags: ["Reviews"],
                summary: "Remove comment/review",
                description: "Endpoint exists, but the controller is currently empty.",
                responses: { 501: { description: "Not implemented" } }
            }
        },
        "/cart/getCart/": {
            get: {
                tags: ["Cart"],
                summary: "Get cart",
                security: [{ cookieAuth: [] }],
                responses: {
                    200: { description: "Current buyer cart" },
                    403: { description: "User must be a buyer" }
                }
            }
        },
        "/cart/addItem/": {
            post: {
                tags: ["Cart"],
                summary: "Add a product to the current buyer cart",
                description: "Uses the Authorization cookie. Creates a cart for the buyer if one does not exist and reserves stock by decrementing product stock.",
                security: [{ cookieAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: { $ref: "#/components/schemas/CartInput" }
                        }
                    }
                },
                responses: {
                    200: { description: "Product added to cart" },
                    400: { description: "Missing fields or insufficient stock" },
                    403: { description: "User must be a buyer" },
                    404: { description: "Product not found" }
                }
            }
        },
        "/cart/clearCart/": {
            delete: {
                tags: ["Cart"],
                summary: "Clear cart",
                security: [{ cookieAuth: [] }],
                responses: {
                    200: { description: "Cart cleared" },
                    403: { description: "User must be a buyer" }
                }
            }
        },
        "/cart/decrementItem/{productId}": {
            patch: {
                tags: ["Cart"],
                summary: "Decrease one cart item quantity",
                description: "Decreases the selected cart item by one and restores one unit to product stock. Removes the item if its quantity reaches zero.",
                security: [{ cookieAuth: [] }],
                parameters: [
                    { name: "productId", in: "path", required: true, schema: { type: "string" } }
                ],
                responses: {
                    200: { description: "Cart item quantity updated" },
                    403: { description: "User must be a buyer" },
                    404: { description: "Cart or cart item not found" }
                }
            }
        },
        "/cart/removeItem/{productId}": {
            delete: {
                tags: ["Cart"],
                summary: "Remove one product from the current buyer cart",
                description: "Removes the cart item and restores the removed quantity to product stock.",
                security: [{ cookieAuth: [] }],
                parameters: [
                    { name: "productId", in: "path", required: true, schema: { type: "string" } }
                ],
                responses: {
                    200: { description: "Product removed from cart" },
                    403: { description: "User must be a buyer" },
                    404: { description: "Cart or cart item not found" }
                }
            }
        },
        "/buyer/getAllBuyers": {
            get: {
                tags: ["Buyer"],
                summary: "Get all buyer accounts",
                responses: {
                    200: { description: "Buyer list" },
                    500: { description: "Server error" }
                }
            }
        },
        "/buyer/getProfile/": {
            get: {
                tags: ["Buyer"],
                summary: "Get buyer profile",
                description: "Endpoint exists, but the controller is currently empty.",
                responses: { 501: { description: "Not implemented" } }
            }
        },
        "/buyer/getPurchaseHistroy": {
            get: {
                tags: ["Buyer"],
                summary: "Get buyer purchase history",
                description: "Endpoint exists, but the controller is currently empty. The route name is currently spelled /getPurchaseHistroy.",
                responses: { 501: { description: "Not implemented" } }
            }
        },
        "/buyer/flagSeller/": {
            patch: {
                tags: ["Buyer"],
                summary: "Flag a seller",
                description: "Endpoint exists, but the controller is currently empty.",
                responses: { 501: { description: "Not implemented" } }
            }
        },
        "/seller/getAllSellers": {
            get: {
                tags: ["Seller"],
                summary: "Get all seller accounts",
                responses: {
                    200: { description: "Seller list" },
                    500: { description: "Server error" }
                }
            }
        },
        "/seller/getProfile/": {
            get: {
                tags: ["Seller"],
                summary: "Get seller profile",
                description: "Endpoint exists, but the controller is currently empty.",
                responses: { 501: { description: "Not implemented" } }
            }
        },
        "/seller/getSellerStore": {
            get: {
                tags: ["Seller"],
                summary: "Get seller store",
                description: "Endpoint exists, but the controller is currently empty.",
                responses: { 501: { description: "Not implemented" } }
            }
        },
        "/seller/flagBuyer/": {
            patch: {
                tags: ["Seller"],
                summary: "Flag a buyer",
                description: "Endpoint exists, but the controller is currently empty.",
                responses: { 501: { description: "Not implemented" } }
            }
        },
        "/seller/{id}/status": {
            patch: {
                tags: ["Seller"],
                summary: "Change product status",
                description: "Endpoint exists, but the controller is currently empty.",
                parameters: [
                    { name: "id", in: "path", required: true, schema: { type: "string" } }
                ],
                responses: { 501: { description: "Not implemented" } }
            }
        }
    }
};
