const jwt = require('jsonwebtoken');
const { signupSchema } = require('../middlewares/validator');
const { doHash, doPassValidation } = require('../utils/hashing');
const userModel = require('../models/usersModel');
const { sendVerificationEmail } = require('../utils/sendEmail'); 

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
            email,
            password: hashedPassword,
            username,
            type,
            storeName,
            phone,
            address,
            isActive: false   // false until they verify email
        });
 
        await newUser.save();
 
        // generate 6-digit code
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const hashedCode = await doHash(code, 12);
 
        // save hashed code + expiry to DB
        await userModel.findByIdAndUpdate(newUser._id, {
            verificationCode: hashedCode,
            verificationCodeExpires: new Date(Date.now() + 10 * 60 * 1000) // 10 min
        });
 
        // send code to user's email
        await sendVerificationEmail(email, code);
 
        return res.status(201).json({
            success: true,
            message: 'Account created! Please check your email for the verification code.'
        });
 
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
    return res
        .clearCookie('Authorization', {
            httpOnly: true,
            secure: false,
            sameSite: 'lax'
        })
        .json({ 
            success: true, 
            message: 'Logged out successfully' 
        });
};

exports.activateAccount = async (req, res) => {
    try {
        const email = req.body.email;
        const code  = req.body.code;

        if (!email || !code) {
            return res.status(400).json({
                success: false,
                message: 'Email and verification code are required'
            });
        }

        // find user and include hidden fields
        const user = await userModel
            .findOne({ email })
            .select('+verificationCode +verificationCodeExpires');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        if (user.isActive) {
            return res.status(400).json({
                success: false,
                message: 'Account is already active'
            });
        }

        if (!user.verificationCode || !user.verificationCodeExpires) {
            return res.status(400).json({
                success: false,
                message: 'No verification code found — request a new one'
            });
        }

        // check if code has expired
        if (user.verificationCodeExpires < new Date()) {
            return res.status(400).json({
                success: false,
                message: 'Verification code has expired — request a new one'
            });
        }

        // check if code matches
        const isValid = await doPassValidation(code, user.verificationCode);
        if (!isValid) {
            return res.status(400).json({
                success: false,
                message: 'Invalid verification code'
            });
        }

        // activate account and clear the code
        await userModel.findByIdAndUpdate(user._id, {
            isActive: true,
            verificationCode: undefined,
            verificationCodeExpires: undefined
        });

        return res.status(200).json({
            success: true,
            message: 'Account activated successfully'
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
exports.resendCode = async (req, res) => {
    try {
        const email = req.body.email;

        if (!email) {
            return res.status(400).json({ success: false, message: 'Email is required' });
        }

        const user = await userModel.findOne({ email });

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        if (user.isActive) {
            return res.status(400).json({ success: false, message: 'Account is already active' });
        }

        // generate new code
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const hashedCode = await doHash(code, 12);

        await userModel.findByIdAndUpdate(user._id, {
            verificationCode: hashedCode,
            verificationCodeExpires: new Date(Date.now() + 10 * 60 * 1000)
        });

        await sendVerificationEmail(email, code);

        return res.status(200).json({ success: true, message: 'New verification code sent to your email' });

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
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
