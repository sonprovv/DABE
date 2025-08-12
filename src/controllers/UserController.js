const { auth, admin } = require('../config/firebase');
const UserService = require("../services/UserService");
const { failResponse, successDataResponse, successResponse } = require("../utils/response")

const formatDate = (date) => {
    const d = new Date(date);
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear().toString();

    return `${day}/${month}/${year}`;
}

const profile = async (req, res) => {
    try {
        const uid = req.user.uid;
        const currentUser = await UserService.getByUID(uid);

        if (currentUser.role==='viewer') currentUser.dob = formatDate(currentUser.dob);
        else if (currentUser.role==='worker') currentUser.createdAt = formatDate(currentUser.createdAt);

        return successDataResponse(res, 200, currentUser, 'user');
    } catch (err) {
        return failResponse(res, 400, err.message);
    }
}

const createUser = async (req, res) => {
    try {
        const { role } = req.body;
        let username = req.user.email.split('@')[0];
        username = username.charAt(0).toUpperCase() + username.slice(1).toLowerCase();
        const rawData = {
            uid: req.user.uid,
            username: username,
            email: req.user.email,
            role: role
        }
        const newUser = await UserService.createUser(rawData);

        if (role=='viewer') newUser.dob = formatDate(newUser.dob);
        else if (role=='worker') newUser.createdAt = formatDate(newUser.createdAt);

        return successDataResponse(res, 200, newUser, 'user');
    } catch (err) {
        return failResponse(res, 400, err.message);
    }
}

const forgotPassword = async (req, res) => {
    try {
        const { email, newPassword, confirmPassword, code, codeEnter } = req.body;

        if (newPassword!==confirmPassword) {
            return failResponse(res, 401, 'Passwords do not match');
        }

        if (code!==codeEnter) {
            return failResponse(res, 401, 'Incorrect verification code');
        }

        const userRecord = await auth.getUserByEmail(email);

        await auth.updateUser(userRecord.uid, {
            password: newPassword,
        })

        return successResponse(res, 200, 'Password changed successfully');
    } catch (err) {
        return failResponse(res, 400, err.message);
    }
}

const changePassword = async (req, res) => {
    try {
        const { newPassword, confirmPassword, code, codeEnter } = req.body;

        if (newPassword!==confirmPassword) {
            return failResponse(res, 401, 'Passwords do not match');
        }

        if (code!==codeEnter) {
            return failResponse(res, 401, 'Incorrect verification code');
        }

        await auth.updateUser(req.user.uid, {
            password: newPassword,
        })

        return successResponse(res, 200, 'Password changed successfully');
    } catch (err) {
        return failResponse(res, 400, err.message);
    }
}

const updateUser = async (req, res) => {
    try {
        const data = req.body;

        const updatedUser = await UserService.updateUser(data);

        if (updatedUser.role==='viewer') updatedUser.dob = formatDate(updatedUser.dob);
        else if (updatedUser.role==='worker') updatedUser.createdAt = formatDate(updatedUser.createdAt);

        return successDataResponse(res, 200, updatedUser, 'user');
    } catch (err) {
        return failResponse(res, 400, err.message);
    }
}

const deleteUser = async (req, res) => {
    try {
        const { userUID } = req.body;

        await UserService.deleteUser(userUID);

        return successResponse(res, 200, 'Deleted user successfully');
    } catch (err) {
        return failResponse(res, 400, err.message);
    }
}

module.exports = {
    profile,
    createUser,
    forgotPassword,
    changePassword,
    updateUser,
    deleteUser,
}