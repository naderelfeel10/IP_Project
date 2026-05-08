const cartModel = require('../models/cartModel');
const productModel = require('../models/productModel');
const userModel = require('../models/usersModel');

const getBuyer = async (userId) => {
    const existingUser = await userModel.findById(userId);
    return existingUser && existingUser.type === "buyerAccount" ? existingUser : null;
};

const calculateTotalPrice = async (itemsList) => {
    let totalPrice = 0;

    for (const item of itemsList) {
        const product = await productModel.findById(item.productId);
        if (!product) {
            throw new Error(`product ${item.productId} not found`);
        }

        totalPrice += product.price * item.quantity;
    }

    return totalPrice;
};

const emptyCartResponse = (buyerId) => ({
    buyerId,
    itemsList: [],
    totalPrice: 0
});

exports.addItemToCart = async (req, res) => {
    try {
        const buyer = await getBuyer(req.userInfo.userId);
        if (!buyer) {
            return res.status(403).json({ success: false, message: "you must be a buyer" });
        }

        const { productId, quantity = 1 } = req.body;
        const itemQuantity = Number(quantity);

        if (!productId || !Number.isInteger(itemQuantity) || itemQuantity < 1) {
            return res.status(400).json({ success: false, message: "productId and a positive quantity are required" });
        }

        const product = await productModel.findById(productId);
        if (!product) {
            return res.status(404).json({ success: false, message: "product not found" });
        }

        let cart = await cartModel.findOne({ buyerId: req.userInfo.userId });
        if (!cart) {
            cart = new cartModel({
                buyerId: req.userInfo.userId,
                itemsList: [],
                totalPrice: 0
            });
        }

        const existingItem = cart.itemsList.find((item) => item.productId.equals(productId));
        const nextQuantity = existingItem ? existingItem.quantity + itemQuantity : itemQuantity;

        if (product.stock < itemQuantity) {
            return res.status(400).json({ success: false, message: `${product.name} is out of stock` });
        }

        if (existingItem) {
            existingItem.quantity = nextQuantity;
        } else {
            cart.itemsList.push({ productId, quantity: itemQuantity });
        }

        cart.totalPrice = await calculateTotalPrice(cart.itemsList);
        await productModel.updateOne(
            { _id: productId },
            { $inc: { stock: -itemQuantity } }
        );
        const savedCart = await cart.save();
        const populatedCart = await savedCart.populate('itemsList.productId', 'name price deliveryTimeEstimate stock');

        res.status(200).json({ success: true, message: "Product added to cart", result: populatedCart });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.clearCart = async (req, res) => {
    try {
        const buyer = await getBuyer(req.userInfo.userId);
        if (!buyer) {
            return res.status(403).json({ success: false, message: "you must be a buyer" });
        }

        const cart = await cartModel.findOne({ buyerId: req.userInfo.userId });
        if (cart) {
            for (const item of cart.itemsList) {
                await productModel.updateOne(
                    { _id: item.productId },
                    { $inc: { stock: item.quantity } }
                );
            }
        }

        await cartModel.deleteOne({ buyerId: req.userInfo.userId });

        res.status(200).json({ success: true, message: "Cart cleared" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.removeItemFromCart = async (req, res) => {
    try {
        const buyer = await getBuyer(req.userInfo.userId);
        if (!buyer) {
            return res.status(403).json({ success: false, message: "you must be a buyer" });
        }

        const { productId } = req.params;
        if (!productId) {
            return res.status(400).json({ success: false, message: "productId is required" });
        }

        const cart = await cartModel.findOne({ buyerId: req.userInfo.userId });
        if (!cart) {
            return res.status(404).json({ success: false, message: "cart not found" });
        }

        const item = cart.itemsList.find((cartItem) => cartItem.productId.equals(productId));
        if (!item) {
            return res.status(404).json({ success: false, message: "product is not in cart" });
        }

        const removedQuantity = item.quantity;
        cart.itemsList = cart.itemsList.filter((cartItem) => !cartItem.productId.equals(productId));
        cart.totalPrice = cart.itemsList.length > 0 ? await calculateTotalPrice(cart.itemsList) : 0;

        await productModel.updateOne(
            { _id: productId },
            { $inc: { stock: removedQuantity } }
        );

        const savedCart = await cart.save();
        const populatedCart = await savedCart.populate('itemsList.productId', 'name price deliveryTimeEstimate stock');

        res.status(200).json({
            success: true,
            message: "Product removed from cart",
            result: populatedCart.itemsList.length > 0
                ? populatedCart
                : emptyCartResponse(req.userInfo.userId)
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.decrementItemQuantity = async (req, res) => {
    try {
        const buyer = await getBuyer(req.userInfo.userId);
        if (!buyer) {
            return res.status(403).json({ success: false, message: "you must be a buyer" });
        }

        const { productId } = req.params;
        if (!productId) {
            return res.status(400).json({ success: false, message: "productId is required" });
        }

        const cart = await cartModel.findOne({ buyerId: req.userInfo.userId });
        if (!cart) {
            return res.status(404).json({ success: false, message: "cart not found" });
        }

        const item = cart.itemsList.find((cartItem) => cartItem.productId.equals(productId));
        if (!item) {
            return res.status(404).json({ success: false, message: "product is not in cart" });
        }

        if (item.quantity > 1) {
            item.quantity -= 1;
        } else {
            cart.itemsList = cart.itemsList.filter((cartItem) => !cartItem.productId.equals(productId));
        }

        cart.totalPrice = cart.itemsList.length > 0 ? await calculateTotalPrice(cart.itemsList) : 0;

        await productModel.updateOne(
            { _id: productId },
            { $inc: { stock: 1 } }
        );

        const savedCart = await cart.save();
        const populatedCart = await savedCart.populate('itemsList.productId', 'name price deliveryTimeEstimate stock');

        res.status(200).json({
            success: true,
            message: "Cart item quantity updated",
            result: populatedCart.itemsList.length > 0
                ? populatedCart
                : emptyCartResponse(req.userInfo.userId)
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getCart = async (req, res) => {
    try {
        const buyer = await getBuyer(req.userInfo.userId);
        if (!buyer) {
            return res.status(403).json({ success: false, message: "you must be a buyer" });
        }

        const cart = await cartModel
            .findOne({ buyerId: req.userInfo.userId })
            .populate('itemsList.productId', 'name price deliveryTimeEstimate stock');

        if (!cart || cart.itemsList.length === 0) {
            return res.status(200).json({
                success: true,
                result: emptyCartResponse(req.userInfo.userId)
            });
        }

        res.status(200).json({
            success: true,
            result: cart
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
