const { auth } = require('../config/firebase');
const { failResponse } = require('../utils/response');

const verifyToken = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader?.startsWith("Bearer ")) {
        return failResponse(res, 401, "Không tìm thấy token");
    }

    const idToken = authHeader.split('Bearer ')[1];

    try {
        const decodedToken = await auth.verifyIdToken(idToken);
        req.user = decodedToken;
        next();
    } catch (error) {
        return failResponse(res, 403, "Token không hợp lệ");
    }
}

module.exports = { verifyToken };