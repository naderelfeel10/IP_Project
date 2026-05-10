const flagModel = require('../models/flagModel');
const productModel = require('../models/productModel');
const userModel = require('../models/usersModel');

exports.getAllFlags = async (req, res) => {
    try {
        const flags = await flagModel.find()
            .populate('userId', 'username email type')
            .populate('buyerId', 'username email type isActive flagCount')
            .populate('sellerId', 'username email storeName type isActive flagCount')
            .populate('orderId', 'status totalPrice createdAt')
            .populate('productId', 'name price category')
            .sort({ createdAt: -1 });

        res.json({ success: true, flags: flags, result: flags });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateUserStatus = async (req, res) => {
    try {
        const userId = req.params.id;
        const isActive = req.body.isActive;

        if (typeof isActive !== 'boolean') {
            return res.status(400).json({ success: false, message: 'isActive must be true or false' });
        }

        if (userId === req.userInfo.userId) {
            return res.status(400).json({ success: false, message: 'admin cannot change their own status' });
        }

        const user = await userModel.findById(userId);

        if (!user) {
            return res.status(404).json({ success: false, message: 'user not found' });
        }

        user.isActive = isActive;
        user.flagCount = isActive ? 0 : 1;
        await user.save();

        if (user.type === 'sellerAccount' && isActive === false) {
            await productModel.updateMany(
                { sellerId: user._id },
                { available: false }
            );
        }

        res.json({
            success: true,
            message: user.type === 'sellerAccount' && isActive === false
                ? 'seller deactivated and products hidden'
                : 'user status updated',
            result: {
                _id: user._id,
                email: user.email,
                username: user.username,
                storeName: user.storeName,
                type: user.type,
                isActive: user.isActive,
                flagCount: user.flagCount
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getUserFlags = async (req, res) => {
    try {
        const userId = req.params.id;
        const role = req.params.role;

        const user = await userModel
            .findById(userId)
            .select('username email storeName type isActive flagCount phone address shippingAddress createdAt');

        if (!user) {
            return res.status(404).json({ success: false, message: 'user not found' });
        }

        const filter = role === 'seller' ? { sellerId: userId } : { buyerId: userId };

        const flags = await flagModel.find(filter)
            .populate('userId', 'username email type')
            .populate('buyerId', 'username email type isActive flagCount')
            .populate('sellerId', 'username email storeName type isActive flagCount')
            .populate('orderId', 'status totalPrice createdAt')
            .populate('productId', 'name price category')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            user: user,
            flags: flags,
            result: {
                user: user,
                flags: flags
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateFlagStatus = async (req, res) => {
    try {
        const flagId = req.params.id;
        const status = req.body.status;

        if (!['Open', 'Resolved'].includes(status)) {
            return res.status(400).json({ success: false, message: 'status must be Open or Resolved' });
        }

        const flag = await flagModel.findByIdAndUpdate(
            flagId,
            { status: status },
            { new: true }
        );

        if (!flag) {
            return res.status(404).json({ success: false, message: 'flag not found' });
        }

        res.json({ success: true, message: 'flag status updated', result: flag });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
