const UserService = require("../services/UserService");
const WorkerService = require("../services/WorkerService");
const { failResponse, successDataResponse, successResponse } = require("../utils/response");
const { UserInfoValid, WorkerInfoValid, UserValid, WorkerValid } = require("../utils/validator/UserValid");
const { ForgotPasswordValid, ChangePasswordValid } = require("../utils/validator/AuthValid");
const { auth, db } = require("../config/firebase");

const forgotPassword = async (req, res) => {
    try {
        const rawData = req.body;
        const validated = await ForgotPasswordValid.validateAsync(rawData, { stripUnknown: true });

        const userRecord = await auth.getUserByEmail(validated.email);
        await auth.updateUser(userRecord.uid, {
            password: validated.newPassword
        })

        return successResponse(res, 200, "Mật khẩu đã được thay đổi")

    } catch (err) {
        return failResponse(res, 500, err.message)
    }
}

const changePassword = async (req, res) => {
    try {
        const emailToken = req.user.email;
        const rawData = req.body;
        const validated = await ChangePasswordValid.validateAsync({email: emailToken, ...rawData}, { stripUnknown: true });

        const userRecord = await auth.getUserByEmail(validated.email);
        await auth.updateUser(userRecord.uid, {
            password: validated.newPassword
        })

        return successResponse(res, 200, "Mật khẩu đã được thay đổi")

    } catch (err) {
        return failResponse(res, 500, err.message)
    }
}

const updateUser = async (req, res) => {
    try {
        const rawData = req.body;

        let userData;
        if (req.body.role==='user') {
            const validated = await UserValid.validateAsync(rawData, { stripUnknown: true });
            userData = await UserService.updateUser(validated);
        }
        else {
            const validated = await WorkerValid.validateAsync(rawData, { stripUnknown: true });
            userData = await WorkerService.updateUser(validated);
        }
        userData["email"] = req.body.email;
        userData["role"] = req.body.role;
        return successDataResponse(res, 200, userData, 'user')
    } catch (err) {
        return failResponse(res, 500, err.message)
    }
}

const deleteUser = async (req, res) => {

}

module.exports = {
    forgotPassword,
    changePassword,
    updateUser,
    deleteUser
}