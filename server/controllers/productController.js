const mongoose = require('mongoose');
const productModel = require('../models/productModel');

exports.addProduct = async (req, res) => {
    try {
        if (req.userInfo.type !== 'sellerAccount') {
            return res.status(403).json({ success:false, message:'seller account only' });
        }

        const newProduct = new productModel({
            sellerId: req.userInfo.userId,
            name: req.body.name,
            description: req.body.description,
            imageUrl: req.body.imageUrl,
            price: req.body.price,
            category: req.body.category,
            quantity: req.body.quantity,
            available: req.body.available,
            deliveryTimeEstimate: req.body.deliveryTimeEstimate
        });

        const savedProduct = await newProduct.save();
        res.status(201).json({ success: true, product: savedProduct, result: savedProduct });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.removeProduct = async (req, res) => {
    try {
        const deletedProduct = await productModel.findOneAndDelete({
            _id: req.params.id,
            sellerId: req.userInfo.userId
        });

        if (!deletedProduct) {
            return res.status(404).json({ success: false, message: 'product not found' });
        }

        res.json({ success: true, message: 'product deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateProduct = async (req, res) => {
    try {
        const updatedProduct = await productModel.findOneAndUpdate(
            { _id: req.params.id, sellerId: req.userInfo.userId },
            req.body,
            { new: true, runValidators: true }
        );

        if (!updatedProduct) {
            return res.status(404).json({ success: false, message: 'product not found' });
        }

        res.json({ success: true, product: updatedProduct, result: updatedProduct });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getProduct = async (req, res) => {
    try {
        const product = await productModel.findById(req.params.id).populate('sellerId', 'username email storeName');

        if (!product) {
            return res.status(404).json({ success: false, message: 'product not found' });
        }

        res.json({ success: true, product: product, result: product });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getProducts = async (req, res) => {
    try {
        const category = req.query.category;
        const seller = req.query.seller;
        const search = req.query.search || req.query.keyword;
        const priceFrom = req.query.priceFrom;
        const priceUpTo = req.query.priceUpTo;

        const filter = { available: true };

        if (category) {
            filter.category = category;
        }

        if (seller) {
            if (!mongoose.Types.ObjectId.isValid(seller)) {
                return res.status(400).json({ success:false, message:'invalid seller id' });
            }
            filter.sellerId = seller;
        }

        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { category: { $regex: search, $options: 'i' } }
            ];
        }

        if (priceFrom || priceUpTo) {
            filter.price = {};

            if (priceFrom) {
                filter.price.$gte = Number(priceFrom);
            }

            if (priceUpTo) {
                filter.price.$lte = Number(priceUpTo);
            }
        }

        const products = await productModel.find(filter).sort({ createdAt: -1 });
        res.json({ success: true, products: products, result: products });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.browseCatalog = async (req, res) => {
    try {
        const products = await productModel.find({ available: true }).populate('sellerId', 'username storeName');
        res.json({ success: true, products: products, result: products });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.searchProduct = async (req, res) => {
    try {
        const keyword = req.query.keyword || req.query.search || '';
        const products = await productModel.find({
            available: true,
            $or: [
                { name: { $regex: keyword, $options: 'i' } },
                { description: { $regex: keyword, $options: 'i' } },
                { category: { $regex: keyword, $options: 'i' } }
            ]
        });

        res.json({ success: true, products: products, result: products });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.changeProductStatus = async (req, res) => {
    try {
        const product = await productModel.findOne({
            _id: req.params.id,
            sellerId: req.userInfo.userId
        });

        if (!product) {
            return res.status(404).json({ success: false, message: 'product not found' });
        }

        product.available = req.body.available;
        await product.save();

        res.json({ success: true, product: product, result: product });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getSellerProducts = async (req, res) => {
    try {
        const products = await productModel.find({ sellerId: req.userInfo.userId }).sort({ createdAt: -1 });
        res.json({ success: true, products: products, result: products });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getPublicSellerProducts = async (req, res) => {
    try {
        const products = await productModel.find({ sellerId: req.params.id, available: true }).sort({ createdAt: -1 });
        res.json({ success: true, products: products, result: products });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.viewProductsCategories = async (req, res) => {
    try {
        const categories = await productModel.distinct('category', { sellerId: req.userInfo.userId });
        res.json({ success: true, categories: categories.filter(Boolean), result: categories.filter(Boolean) });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getAllCategories = async (req, res) => {
    try {
        const categories = await productModel.distinct('category', { available: true });
        res.json({ success: true, categories: categories.filter(Boolean), result: categories.filter(Boolean) });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getCategory = async (req, res) => {
    try {
        const products = await productModel.find({
            category: req.params.cat_name,
            available: true
        });

        res.json({ success: true, products: products, result: products });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
