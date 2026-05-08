const userModel = require('../models/usersModel');

exports.getAllBuyers = async (req, res) => {
    try {
        const buyers = await userModel
            .find({ type:'buyerAccount' })
            .select('email username type isActive shippingAddress flagCount');

        res.json({ success:true, result: buyers });
    } catch (error) {
        res.status(500).json({ success:false, message:error.message });
    }
};

exports.getProfile = async (req, res) => {
    try {
        const buyer = await userModel.findById(req.userInfo.userId);
        res.json({ success:true, buyer: buyer, result: buyer });
    } catch (error) {
        res.status(500).json({ success:false, message:error.message });
    }
};

exports.getPurchaseHistroy = (req, res) => {
    res.json({ success:true, message:'use /orders/myOrders for purchase history' });
};

exports.flagSeller = (req, res) => {
    res.json({ success:true, message:'use /orders/reportIssue/:id to flag sellers' });
};
