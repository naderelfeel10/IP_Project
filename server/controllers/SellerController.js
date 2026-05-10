const userModel = require('../models/usersModel');
const productModel = require('../models/productModel');
const categoryModel = require('../models/categoryModel');
const orderModel = require('../models/orderModel');
const flagModel = require('../models/flagModel');

exports.getAllSellers = async (req, res) => {
    try {
        const sellers = await userModel
            .find({ type: 'sellerAccount' })
            .select('email username storeName phone address type isActive shippingAddress flagCount serviceArea');

        res.json({ success: true, result: sellers });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getSellerStore = async (req, res) => {
    try {
        const productsCount = await productModel.countDocuments({ sellerId: req.userInfo.userId });
        const categoriesCount = await categoryModel.countDocuments({ sellerId: req.userInfo.userId });
        const sellerProducts = await productModel.find({ sellerId: req.userInfo.userId }).select('_id');
        const productIds = sellerProducts.map((product) => product._id);
        const ordersCount = await orderModel.countDocuments({ 'itemsList.productId': { $in: productIds } });
        const flagsCount = await flagModel.countDocuments({ sellerId: req.userInfo.userId });

        res.json({
            success: true,
            store: {
                productsCount: productsCount,
                categoriesCount: categoriesCount,
                ordersCount: ordersCount,
                flagsCount: flagsCount
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getProfile = async (req, res) => {
    try {
        const seller = await userModel.findById(req.userInfo.userId);

        if (!seller) {
            return res.status(404).json({ success: false, message: 'seller not found' });
        }

        res.json({ success: true, seller: seller });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const seller = await userModel.findByIdAndUpdate(
            req.userInfo.userId,
            {
                username: req.body.username,
                storeName: req.body.storeName,
                phone: req.body.phone,
                address: req.body.address
            },
            { new: true, runValidators: true }
        );

        res.json({ success: true, seller: seller });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.flagBuyer = async (req, res) => {
    try {
        let buyerId = req.body.buyerId;

        if (!buyerId && req.body.orderId) {
            const order = await orderModel.findById(req.body.orderId);

            if (order) {
                buyerId = order.buyerId;
            }
        }

        if (!buyerId) {
            return res.status(400).json({ success: false, message: 'buyer is required' });
        }

        const newFlag = new flagModel({
            sellerId: req.userInfo.userId,
            buyerId: buyerId,
            orderId: req.body.orderId,
            reason: req.body.reason,
            details: req.body.details
        });

        const savedFlag = await newFlag.save();
        await userModel.findByIdAndUpdate(buyerId, { $inc: { flagCount: 1 } });

        res.status(201).json({ success: true, flag: savedFlag });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getMyFlags = async (req, res) => {
    try {
        const flags = await flagModel.find({ sellerId: req.userInfo.userId })
            .populate('buyerId', 'username email flagCount')
            .populate('orderId')
            .sort({ createdAt: -1 });

        res.json({ success: true, flags: flags });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.updateServiceArea = async (req, res) => {
    try {
        const { serviceArea } = req.body;

        if (!Array.isArray(serviceArea)) {
            return res.status(400).json({ 
                success: false, 
                message: 'serviceArea must be an array of areas' 
            });
        }

        
        const serviceabilityBonus = serviceArea.length >= 3 ? 5 : 0;

        const seller = await userModel.findByIdAndUpdate(
            req.userInfo.userId,
            { serviceArea, serviceabilityBonus },
            { new: true }
        );

        return res.json({
            success: true,
            message: serviceabilityBonus > 0 
                ? `Service area updated! You earned serviceability Discount!`
                : 'Service area updated.',
            serviceArea: seller.serviceArea,
            serviceabilityBonus: seller.serviceabilityBonus
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};