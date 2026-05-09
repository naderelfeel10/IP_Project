const categoryModel = require('../models/categoryModel');
const productModel = require('../models/productModel');

exports.createCategory = async (req, res) => {
    try {
        const oldCategory = await categoryModel.findOne({
            sellerId: req.userInfo.userId,
            name: req.body.name
        });

        if (oldCategory) {
            return res.status(400).json({ success: false, message: 'category already exists' });
        }

        const category = new categoryModel({
            sellerId: req.userInfo.userId,
            name: req.body.name
        });

        const savedCategory = await category.save();
        res.status(201).json({ success: true, category: savedCategory });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getCategories = async (req, res) => {
    try {
        const categories = await categoryModel.find({ sellerId: req.userInfo.userId }).sort({ createdAt: -1 });
        res.json({ success: true, categories: categories });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateCategory = async (req, res) => {
    try {
        const category = await categoryModel.findOne({
            _id: req.params.id,
            sellerId: req.userInfo.userId
        });

        if (!category) {
            return res.status(404).json({ success: false, message: 'category not found' });
        }

        const oldName = category.name;
        category.name = req.body.name;
        await category.save();

        await productModel.updateMany(
            { sellerId: req.userInfo.userId, category: oldName },
            { category: req.body.name }
        );

        res.json({ success: true, category: category });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteCategory = async (req, res) => {
    try {
        const category = await categoryModel.findOneAndDelete({
            _id: req.params.id,
            sellerId: req.userInfo.userId
        });

        if (!category) {
            return res.status(404).json({ success: false, message: 'category not found' });
        }

        await productModel.updateMany(
            { sellerId: req.userInfo.userId, category: category.name },
            { category: '' }
        );

        res.json({ success: true, message: 'category deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
