const { auth, db } = require('../config/firebase');
const UserService = require('../services/UserService');
const { failResponse } = require('../utils/response');

const checkPermission = (roles) => {
    return async (req, res, next) => {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader?.startsWith("Bearer ")) {
            return failResponse(res, 401, "Missing token");
        }
    
        const idToken = authHeader.split('Bearer ')[1];
    
        try {
            const decodedToken = await auth.verifyIdToken(idToken);
            req.user = decodedToken;

            const userDoc = await db.collection('users').doc(req.user.uid).get();
            if (!userDoc.exists) {
                return failResponse(res, 400, "Not found user");
            }

            const userData = userDoc.data();
            
            if (!roles.includes(String(userData.role).trim())) {
                return failResponse(res, 403, "No access allowed");
            }

            next();
        } catch (error) {
            return failResponse(res, 403, "Invalid token");
        }
    }
}

module.exports = { checkPermission };