const productModel = require('../models/productModel');

exports.addProduct = async (req, res) => {
    try {
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
        res.status(201).json({ success: true, product: savedProduct });
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

        res.json({ success: true, product: updatedProduct });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getProduct = async (req, res) => {
    try {
        const product = await productModel.findOne({
            _id: req.params.id,
            sellerId: req.userInfo.userId
        });

        if (!product) {
            return res.status(404).json({ success: false, message: 'product not found' });
        }

        res.json({ success: true, product: product });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.browseCatalog = async (req, res) => {
    try {
        const products = await productModel.find({ available: true }).populate('sellerId', 'username storeName');
        res.json({ success: true, products: products });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.searchProduct = async (req, res) => {
    try {
        const keyword = req.query.keyword || '';
        const products = await productModel.find({
            available: true,
            $or: [
                { name: { $regex: keyword, $options: 'i' } },
                { description: { $regex: keyword, $options: 'i' } },
                { category: { $regex: keyword, $options: 'i' } }
            ]
        });

        res.json({ success: true, products: products });
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

        res.json({ success: true, product: product });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getSellerProducts = async (req, res) => {
    try {
        const products = await productModel.find({ sellerId: req.userInfo.userId }).sort({ createdAt: -1 });
        res.json({ success: true, products: products });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.viewProductsCategories = async (req, res) => {
    try {
        const categories = await productModel.distinct('category', { sellerId: req.userInfo.userId });
        res.json({ success: true, categories: categories });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

