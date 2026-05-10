const cartModel = require('../models/cartModel');
const productModel = require('../models/productModel');
const userModel = require('../models/usersModel');

const getBuyer = async (userId) => {
    const user = await userModel.findById(userId);
    return user && user.type === 'buyerAccount' ? user : null;
};

const calculateTotalPrice = async (itemsList) => {
    let totalPrice = 0;

    for (const item of itemsList) {
        const product = await productModel.findById(item.productId);

        if (!product) {
            throw new Error('product not found');
        }

        totalPrice += product.price * item.quantity;
    }

    return totalPrice;
};

const emptyCart = (buyerId) => ({
    buyerId: buyerId,
    itemsList: [],
    totalPrice: 0
});

exports.addItemToCart = async (req, res) => {
    try {
        const buyer = await getBuyer(req.userInfo.userId);

        if (!buyer) {
            return res.status(403).json({ success:false, message:'buyer account only' });
        }

        const productId = req.body.productId;
        const quantity = Number(req.body.quantity || 1);

        if (!productId || quantity < 1) {
            return res.status(400).json({ success:false, message:'product and quantity are required' });
        }

        const product = await productModel.findById(productId);

        if (!product || !product.available) {
            return res.status(404).json({ success:false, message:'product not found' });
        }

        if (product.quantity < quantity) {
            return res.status(400).json({ success:false, message:`${product.name} is out of stock` });
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

        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.itemsList.push({ productId: productId, quantity: quantity });
        }

        await productModel.updateOne(
            { _id: productId },
            { $inc: { quantity: -quantity } }
        );

        cart.totalPrice = await calculateTotalPrice(cart.itemsList);
        const savedCart = await cart.save();
        const populatedCart = await savedCart.populate('itemsList.productId', 'name price deliveryTimeEstimate quantity');

        res.json({ success:true, message:'product added to cart', result: populatedCart });
    } catch (error) {
        res.status(500).json({ success:false, message:error.message });
    }
};

exports.clearCart = async (req, res) => {
    try {
        const buyer = await getBuyer(req.userInfo.userId);

        if (!buyer) {
            return res.status(403).json({ success:false, message:'buyer account only' });
        }

        const cart = await cartModel.findOne({ buyerId: req.userInfo.userId });

        if (cart) {
            for (const item of cart.itemsList) {
                await productModel.updateOne(
                    { _id: item.productId },
                    { $inc: { quantity: item.quantity } }
                );
            }
        }

        await cartModel.deleteOne({ buyerId: req.userInfo.userId });
        res.json({ success:true, message:'cart cleared' });
    } catch (error) {
        res.status(500).json({ success:false, message:error.message });
    }
};

exports.removeItemFromCart = async (req, res) => {
    try {
        const buyer = await getBuyer(req.userInfo.userId);

        if (!buyer) {
            return res.status(403).json({ success:false, message:'buyer account only' });
        }

        const cart = await cartModel.findOne({ buyerId: req.userInfo.userId });

        if (!cart) {
            return res.status(404).json({ success:false, message:'cart not found' });
        }

        const item = cart.itemsList.find((cartItem) => cartItem.productId.equals(req.params.productId));

        if (!item) {
            return res.status(404).json({ success:false, message:'product is not in cart' });
        }

        await productModel.updateOne(
            { _id: req.params.productId },
            { $inc: { quantity: item.quantity } }
        );

        cart.itemsList = cart.itemsList.filter((cartItem) => !cartItem.productId.equals(req.params.productId));
        cart.totalPrice = cart.itemsList.length ? await calculateTotalPrice(cart.itemsList) : 0;

        const savedCart = await cart.save();
        const populatedCart = await savedCart.populate('itemsList.productId', 'name price deliveryTimeEstimate quantity');

        res.json({
            success:true,
            message:'product removed',
            result: populatedCart.itemsList.length ? populatedCart : emptyCart(req.userInfo.userId)
        });
    } catch (error) {
        res.status(500).json({ success:false, message:error.message });
    }
};

exports.decrementItemQuantity = async (req, res) => {
    try {
        const buyer = await getBuyer(req.userInfo.userId);

        if (!buyer) {
            return res.status(403).json({ success:false, message:'buyer account only' });
        }

        const cart = await cartModel.findOne({ buyerId: req.userInfo.userId });

        if (!cart) {
            return res.status(404).json({ success:false, message:'cart not found' });
        }

        const item = cart.itemsList.find((cartItem) => cartItem.productId.equals(req.params.productId));

        if (!item) {
            return res.status(404).json({ success:false, message:'product is not in cart' });
        }

        if (item.quantity > 1) {
            item.quantity -= 1;
        } else {
            cart.itemsList = cart.itemsList.filter((cartItem) => !cartItem.productId.equals(req.params.productId));
        }

        await productModel.updateOne(
            { _id: req.params.productId },
            { $inc: { quantity: 1 } }
        );

        cart.totalPrice = cart.itemsList.length ? await calculateTotalPrice(cart.itemsList) : 0;

        const savedCart = await cart.save();
        const populatedCart = await savedCart.populate('itemsList.productId', 'name price deliveryTimeEstimate quantity');

        res.json({
            success:true,
            message:'cart item updated',
            result: populatedCart.itemsList.length ? populatedCart : emptyCart(req.userInfo.userId)
        });
    } catch (error) {
        res.status(500).json({ success:false, message:error.message });
    }
};

exports.getCart = async (req, res) => {
    try {
        const buyer = await getBuyer(req.userInfo.userId);

        if (!buyer) {
            return res.status(403).json({ success:false, message:'buyer account only' });
        }

        const cart = await cartModel
            .findOne({ buyerId: req.userInfo.userId })
            .populate({
                path: 'itemsList.productId',
                select: 'name price deliveryTimeEstimate quantity sellerId',
                populate: {
                    path: 'sellerId',
                    select: 'serviceArea'
                }
            });

        if (!cart || cart.itemsList.length === 0) {
            return res.json({ success:true, result: emptyCart(req.userInfo.userId) });
        }

        res.json({ success:true, result: cart });
    } catch (error) {
        res.status(500).json({ success:false, message:error.message });
    }
};

