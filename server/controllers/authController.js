const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { signupSchema } = require('../middlewares/validator');
const { doHash, doPassValidation } = require('../utils/hashing');
const userModel = require('../models/usersModel');
const cartModel = require('../models/cartModel');
const categoryModel = require('../models/categoryModel');
const flagModel = require('../models/flagModel');
const productModel = require('../models/productModel');
const reviewModel = require('../models/reviewModel');

const recalculateProductAvgRating = async (productId) => {
    const castProductId = new mongoose.Types.ObjectId(productId);
    const result = await reviewModel.aggregate([
        { $match: { productId: castProductId } },
        { $group: { _id: '$productId', avgRating: { $avg: '$rating' } } }
    ]);

    const avgRating = result.length ? Number(result[0].avgRating.toFixed(2)) : 0;
    await productModel.updateOne({ _id: castProductId }, { avgRating: avgRating });
};

const recalculateCartTotal = async (cart) => {
    let totalPrice = 0;

    for (const item of cart.itemsList) {
        const product = await productModel.findById(item.productId);

        if (product) {
            totalPrice += product.price * item.quantity;
        }
    }

    cart.totalPrice = totalPrice;
    await cart.save();
};

exports.createAccount = async (req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password;
        const username = req.body.username;
        const type = req.body.type || 'sellerAccount';
        const storeName = req.body.storeName;
        const phone = req.body.phone;
        const address = req.body.address;

        const { error } = signupSchema.validate({ email, password });

        if (error) {
            return res.status(401).json({
                success: false,
                message: error.details[0].message
            });
        }

        const existingUser = await userModel.findOne({ email });

        if (existingUser) {
            return res.status(401).json({ success: false, message: 'user already exists' });
        }

        const hashedPassword = await doHash(password, 12);

        const newUser = new userModel({
            email: email,
            password: hashedPassword,
            username: username,
            type: type,
            storeName: storeName,
            phone: phone,
            address: address,
            isActive: true
        });

        await newUser.save();

        return res.status(201).json({ success: true, message: 'Done signing up' });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

exports.signin = async (req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password;

        const existingUser = await userModel.findOne({ email }).select('+password');

        if (!existingUser) {
            return res.status(401).json({ success: false, message: 'User not found' });
        }

        const result = await doPassValidation(password, existingUser.password);

        if (!result) {
            return res.status(401).json({ success: false, message: 'Email or password is incorrect' });
        }

        const token = jwt.sign({
            userId: existingUser._id,
            email: existingUser.email,
            username: existingUser.username,
            type: existingUser.type
        }, process.env.JWT_SECRET || 'elfeel', {
            expiresIn: '80h'
        });

        return res.cookie('Authorization', 'Bearer ' + token, {
            expires: new Date(Date.now() + 80 * 3600000),
            httpOnly: true,
            secure: false,
            sameSite: 'lax'
        }).json({
            success: true,
            token: token,
            user: {
                _id: existingUser._id,
                email: existingUser.email,
                username: existingUser.username,
                type: existingUser.type,
                storeName: existingUser.storeName,
                phone: existingUser.phone,
                address: existingUser.address
            },
            message: 'Signed in successfully'
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

exports.logout = async (req, res) => {
    return res.clearCookie('Authorization').json({ success: true, message: 'logged out' });
};

exports.activateAccount = async (req, res) => {
    res.json({ success: true, message: 'activate account route' });
};

exports.changePassword = async (req, res) => {
    try {
        const currentPassword = req.body.currentPassword || req.body.oldPassword || req.body.password;
        const newPassword = req.body.newPassword;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ success: false, message: 'current password and new password are required' });
        }

        if (newPassword.length < 8 || newPassword.length > 60) {
            return res.status(400).json({ success: false, message: 'new password must be between 8 and 60 characters' });
        }

        const user = await userModel.findById(req.userInfo.userId).select('+password');

        if (!user) {
            return res.status(404).json({ success: false, message: 'user not found' });
        }

        const isPasswordCorrect = await doPassValidation(currentPassword, user.password);

        if (!isPasswordCorrect) {
            return res.status(401).json({ success: false, message: 'current password is incorrect' });
        }

        user.password = await doHash(newPassword, 12);
        await user.save();

        res.json({ success: true, message: 'password changed successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


exports.updateEmail = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'email and password are required' });
        }

        const existingUser = await userModel.findOne({ email });
        if (existingUser && existingUser._id.toString() !== req.userInfo.userId) {
            return res.status(409).json({ success: false, message: 'email already exists' });
        }

        const user = await userModel.findById(req.userInfo.userId).select('+password');

        if (!user) {
            return res.status(404).json({ success: false, message: 'user not found' });
        }

        const isPasswordCorrect = await doPassValidation(password, user.password);

        if (!isPasswordCorrect) {
            return res.status(401).json({ success: false, message: 'password is incorrect' });
        }

        user.email = email;
        await user.save();

        const token = jwt.sign(
            { userId: user._id, email: user.email, username: user.username, type: user.type },
            process.env.JWT_SECRET || 'elfeel',
            { expiresIn: '80h' }
        );

        res.cookie('Authorization', 'Bearer ' + token, {
            expires: new Date(Date.now() + 80 * 3600000),
            httpOnly: true,
            secure: false,
            sameSite: 'lax'
        });

        return res.status(200).json({
            success: true,
            message: 'email updated successfully',
            token,
            user: {
                _id: user._id,
                email: user.email,
                username: user.username,
                type: user.type,
                storeName: user.storeName,
                phone: user.phone,
                address: user.address
            }
        });

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};


exports.deleteAccount = async (req, res) => {
    try {
        const password = req.body.password;
        const user = await userModel.findById(req.userInfo.userId).select('+password');

        if (!user) {
            return res.status(404).json({ success: false, message: 'user not found' });
        }

        if (password) {
            const isPasswordCorrect = await doPassValidation(password, user.password);

            if (!isPasswordCorrect) {
                return res.status(401).json({ success: false, message: 'password is incorrect' });
            }
        }

        if (user.type === 'buyerAccount') {
            const cart = await cartModel.findOne({ buyerId: user._id });

            if (cart) {
                for (const item of cart.itemsList) {
                    await productModel.updateOne(
                        { _id: item.productId },
                        { $inc: { quantity: item.quantity } }
                    );
                }
            }

            const reviews = await reviewModel.find({ buyerId: user._id }).select('productId');
            const reviewedProductIds = [...new Set(reviews.map((review) => review.productId.toString()))];

            await cartModel.deleteMany({ buyerId: user._id });
            await reviewModel.deleteMany({ buyerId: user._id });
            await flagModel.deleteMany({ $or: [{ buyerId: user._id }, { userId: user._id }] });

            for (const productId of reviewedProductIds) {
                await recalculateProductAvgRating(productId);
            }
        }

        if (user.type === 'sellerAccount') {
            const products = await productModel.find({ sellerId: user._id }).select('_id');
            const productIds = products.map((product) => product._id);
            const cartsWithSellerProducts = await cartModel.find({ 'itemsList.productId': { $in: productIds } });

            await cartModel.updateMany(
                { 'itemsList.productId': { $in: productIds } },
                { $pull: { itemsList: { productId: { $in: productIds } } } }
            );

            for (const cart of cartsWithSellerProducts) {
                const updatedCart = await cartModel.findById(cart._id);

                if (updatedCart) {
                    await recalculateCartTotal(updatedCart);
                }
            }

            await reviewModel.deleteMany({ productId: { $in: productIds } });
            await productModel.deleteMany({ sellerId: user._id });
            await categoryModel.deleteMany({ sellerId: user._id });
            await flagModel.deleteMany({ sellerId: user._id });
        }

        await userModel.deleteOne({ _id: user._id });

        res.clearCookie('Authorization').json({ success: true, message: 'account deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
