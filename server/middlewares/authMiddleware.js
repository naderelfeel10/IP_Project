const jwt = require('jsonwebtoken');

const authMiddleWare = (req, res, next) => {
    const cookieAuth = req.cookies.Authorization;
    const headerAuth = req.headers.authorization;
    const authValue = headerAuth || cookieAuth;

    if (!authValue || !authValue.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, message: 'login first' });
    }

    const token = authValue.split(' ')[1];

    try {
        const decodedTokenInfo = jwt.verify(token, process.env.JWT_SECRET || 'elfeel');
        req.userInfo = decodedTokenInfo;
        next();
    } catch (e) {
        return res.status(401).json({ success: false, message: 'invalid jwt token' });
    }
};

const sellerOnly = (req, res, next) => {
    if (req.userInfo.type !== 'sellerAccount') {
        return res.status(403).json({ success: false, message: 'seller account only' });
    }

    next();
};

const buyerOnly = (req, res, next) => {
    if (req.userInfo.type !== 'buyerAccount') {
        return res.status(403).json({ success: false, message: 'buyer account only' });
    }

    next();
};

const adminOnly = (req, res, next) => {
    if (req.userInfo.type !== 'admin') {
        return res.status(403).json({ success: false, message: 'admin account only' });
    }

    next();
};

module.exports = { authMiddleWare, sellerOnly, buyerOnly, adminOnly };
