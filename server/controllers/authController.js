const jwt = require('jsonwebtoken');
const { signupSchema } = require('../middlewares/validator');
const { doHash, doPassValidation } = require('../utils/hashing');
const userModel = require('../models/usersModel');

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
        }, process.env.JWT_SECRET, {
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
    res.json({ success: true, message: 'change password route' });
};

exports.updateEmail = async (req, res) => {
    res.json({ success: true, message: 'update email route' });
};

exports.deleteAccount = async (req, res) => {
    res.json({ success: true, message: 'delete account route' });
};
