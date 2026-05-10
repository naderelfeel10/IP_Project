const orderModel = require('../models/orderModel');
const userModel = require('../models/usersModel');
const productModel = require('../models/productModel');
const flagModel = require('../models/flagModel');
const cartModel = require('../models/cartModel');

const getSellerProductIds = async (sellerId) => {
    const products = await productModel.find({ sellerId: sellerId }).select('_id');
    return products.map((product) => product._id);
};

const populateOrder = (query) => {
    return query
        .populate('buyerId', 'username email phone shippingAddress flagCount')
        .populate('itemsList.productId');
};

exports.addOrder = async (req, res) => {
    try {
        if (req.userInfo.type !== 'buyerAccount') {
            return res.status(403).json({ success: false, message: 'buyer account only' });
        }

        const items = req.body.itemList || req.body.itemsList || [];
        const shippingAddress = req.body.shippingAddress;
        const buyerComment = req.body.buyerComment || req.body.orderComment || '';
        const stockAlreadyReserved = req.body.stockAlreadyReserved || false;

        if (items.length === 0) {
            return res.status(400).json({ success: false, message: 'order items are required' });
        }

        let cart = null;

        if (stockAlreadyReserved) {
            cart = await cartModel.findOne({ buyerId: req.userInfo.userId });

            if (!cart) {
                return res.status(400).json({ success: false, message: 'cart not found' });
            }
        }

        const orderGroupsBySeller = {};

        for (const item of items) {
            const productId = item.productId;
            const quantity = Number(item.quantity || 1);

            if (!productId || quantity < 1) {
                return res.status(400).json({ success: false, message: 'valid product and quantity are required' });
            }

            const product = await productModel.findById(productId);

            if (!product) {
                return res.status(404).json({ success: false, message: 'product not found' });
            }

            if (!stockAlreadyReserved && product.quantity < quantity) {
                return res.status(400).json({ success: false, message: `${product.name} is out of stock` });
            }

            if (stockAlreadyReserved) {
                const reservedItem = cart.itemsList.find((cartItem) => (
                    cartItem.productId.equals(productId) && cartItem.quantity >= quantity
                ));

                if (!reservedItem) {
                    return res.status(400).json({ success: false, message: 'order items must match cart items' });
                }
            }

            const sellerId = product.sellerId.toString();

            if (!orderGroupsBySeller[sellerId]) {
                orderGroupsBySeller[sellerId] = {
                    itemsList: [],
                    totalPrice: 0
                };
            }

            orderGroupsBySeller[sellerId].itemsList.push({
                productId: product._id,
                quantity: quantity
            });
            orderGroupsBySeller[sellerId].totalPrice += product.price * quantity;
        }

        if (!stockAlreadyReserved) {
            for (const item of items) {
                await productModel.updateOne(
                    { _id: item.productId },
                    { $inc: { quantity: -Number(item.quantity || 1) } }
                );
            }
        }

        const orders = await orderModel.insertMany(
            Object.values(orderGroupsBySeller).map((sellerOrder) => ({
                buyerId: req.userInfo.userId,
                itemsList: sellerOrder.itemsList,
                totalPrice: sellerOrder.totalPrice,
                shippingAddress: shippingAddress,
                buyerComment: buyerComment,
                orderComment: buyerComment,
                statusHistory: [{ status: 'Pending' }]
            }))
        );

        if (stockAlreadyReserved) {
            await cartModel.deleteOne({ buyerId: req.userInfo.userId });
        }

        res.status(201).json({
            success: true,
            message: orders.length === 1 ? 'order added' : 'orders added',
            order: orders[0],
            orders: orders,
            result: orders.length === 1 ? orders[0] : orders
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.removeOrder = async (req, res) => {
    try {
        const order = await orderModel.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ success: false, message: 'order not found' });
        }

        if (!order.buyerId.equals(req.userInfo.userId)) {
            return res.status(403).json({ success:false, message:'you are not the owner of this order' });
        }

        if (order.status !== 'Pending') {
            return res.status(400).json({ success:false, message:'only pending orders can be cancelled' });
        }

        for (const item of order.itemsList) {
            await productModel.updateOne(
                { _id: item.productId },
                { $inc: { quantity: item.quantity } }
            );
        }

        await orderModel.deleteOne({ _id: req.params.id });
        res.json({ success:true, message:'order deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateOrder = async (req, res) => {
    try {
        const order = await orderModel.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ success: false, message: 'order not found' });
        }

        if (req.userInfo.type === 'sellerAccount') {
            const sellerProducts = await getSellerProductIds(req.userInfo.userId);
            const ownsOrderProduct = order.itemsList.some((item) => (
                sellerProducts.some((productId) => productId.equals(item.productId))
            ));

            if (!ownsOrderProduct) {
                return res.status(403).json({ success:false, message:'this order is not for this seller' });
            }

            order.status = req.body.status;
            order.statusHistory.push({ status: req.body.status });
            const savedOrder = await order.save();

            return res.json({ success: true, order: savedOrder, result: savedOrder });
        }

        if (!order.buyerId.equals(req.userInfo.userId)) {
            return res.status(403).json({ success:false, message:'you are not the owner of this order' });
        }

        if (order.status !== 'Pending') {
            return res.status(400).json({ success:false, message:'cannot update a processed order' });
        }

        if (req.body.shippingAddress) {
            order.shippingAddress = req.body.shippingAddress;
        }

        if (req.body.buyerComment !== undefined || req.body.orderComment !== undefined) {
            order.buyerComment = req.body.buyerComment || req.body.orderComment;
            order.orderComment = req.body.buyerComment || req.body.orderComment;
        }

        const savedOrder = await order.save();
        res.json({ success: true, order: savedOrder, result: savedOrder });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getOrder = async (req, res) => {
    try {
        const order = await populateOrder(orderModel.findById(req.params.id));

        if (!order) {
            return res.status(404).json({ success: false, message: 'order not found' });
        }

        if (req.userInfo.type === 'buyerAccount' && !order.buyerId._id.equals(req.userInfo.userId)) {
            return res.status(403).json({ success:false, message:'you are not the owner of this order' });
        }

        if (req.userInfo.type === 'sellerAccount') {
            const sellerProducts = await getSellerProductIds(req.userInfo.userId);
            const ownsOrderProduct = order.itemsList.some((item) => (
                sellerProducts.some((productId) => productId.equals(item.productId._id))
            ));

            if (!ownsOrderProduct) {
                return res.status(403).json({ success:false, message:'this order is not for this seller' });
            }
        }

        res.json({ success: true, order: order, result: order });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.traceOrder = async (req, res) => {
    try {
        const order = await populateOrder(orderModel.findById(req.params.id));

        if (!order) {
            return res.status(404).json({ success: false, message: 'order not found' });
        }

        res.json({
            success: true,
            status: order.status,
            history: order.statusHistory,
            details: order
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getSellerOrders = async (req, res) => {
    try {
        if (req.userInfo.type === 'buyerAccount') {
            const orders = await populateOrder(orderModel.find({ buyerId: req.userInfo.userId }).sort({ createdAt: -1 }));
            return res.json({ success: true, orders: orders, result: orders });
        }

        const sellerProducts = await getSellerProductIds(req.userInfo.userId);
        const orders = await populateOrder(orderModel.find({
            'itemsList.productId': { $in: sellerProducts }
        }).sort({ createdAt: -1 }));

        res.json({ success: true, orders: orders, result: orders });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getSellerOrdersBasedonType = async (req, res) => {
    try {
        if (req.userInfo.type === 'buyerAccount') {
            const orders = await populateOrder(orderModel.find({
                buyerId: req.userInfo.userId,
                status: req.params.type || req.params.status
            }).sort({ createdAt: -1 }));

            return res.json({ success: true, orders: orders, result: orders });
        }

        const sellerProducts = await getSellerProductIds(req.userInfo.userId);
        const orders = await populateOrder(orderModel.find({
            status: req.params.type || req.params.status,
            'itemsList.productId': { $in: sellerProducts }
        }).sort({ createdAt: -1 }));

        res.json({ success: true, orders: orders, result: orders });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getBuyerOrders = exports.getSellerOrders;
exports.getAllOrders = exports.getSellerOrders;
exports.getSellerOrdersBasedonStatus = exports.getSellerOrdersBasedonType;

exports.progressOrderStatus = async (req, res) => {
    try {
        if (req.userInfo.type !== 'sellerAccount') {
            return res.status(403).json({ success:false, message:'seller account only' });
        }

        req.body.status = req.body.status || 'Delivered';
        return exports.updateOrder(req, res);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.reportIssue = async (req, res) => {
    try {
        if (req.userInfo.type !== 'buyerAccount') {
            return res.status(403).json({ success:false, message:'buyer account only' });
        }

        const order = await orderModel
            .findById(req.params.id)
            .populate('itemsList.productId', 'sellerId');

        if (!order) {
            return res.status(404).json({ success:false, message:'order not found' });
        }

        if (!order.buyerId.equals(req.userInfo.userId)) {
            return res.status(403).json({ success:false, message:'you are not the owner of this order' });
        }

        const issueScope = req.body.issueScope;
        const issueDescription = req.body.issueDescription;

        if (!['Order', 'Product', 'Seller'].includes(issueScope)) {
            return res.status(400).json({ success:false, message:'issueScope must be Order, Product, or Seller' });
        }

        let productId = req.body.productId;
        let sellerId;

        if (issueScope !== 'Order') {
            const orderItem = order.itemsList.find((item) => {
                const itemProductId = item.productId._id || item.productId;
                return itemProductId.toString() === productId;
            });

            if (!orderItem) {
                return res.status(400).json({ success:false, message:'selected product is not in this order' });
            }

            sellerId = orderItem.productId.sellerId;
        }

        const flag = await flagModel.create({
            userId: req.userInfo.userId,
            buyerId: req.userInfo.userId,
            sellerId: sellerId,
            orderId: order._id,
            productId: productId,
            issueScope: issueScope,
            issueDescription: issueDescription,
            reason: issueScope,
            details: issueDescription
        });

        res.status(201).json({ success:true, message:'issue reported', result: flag });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
