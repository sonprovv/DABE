const UserService = require("../services/UserService");
const WorkerService = require("../services/WorkerService");
const AdminService = require("../services/AdminService");
const { failResponse, successDataResponse, successResponse } = require("../utils/response");
const { UserValid, WorkerValid, AdminValid } = require("../utils/validator/ClientValid");
const { ForgotPasswordValid, ChangePasswordValid } = require("../utils/validator/AuthValid");
const { auth } = require("../config/firebase");

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
        const emailToken = req.client.email;
        const rawData = req.body;
        const validated = await ChangePasswordValid.validateAsync({email: emailToken, ...rawData}, { stripUnknown: true });

        const clientRecord = await auth.getUserByEmail(validated.email);
        await auth.updateUser(clientRecord.uid, {
            password: validated.newPassword
        })

        return successResponse(res, 200, "Mật khẩu đã được thay đổi")

    } catch (err) {
        return failResponse(res, 500, err.message)
    }
}

const updateClient = async (req, res) => {
    try {
        const rawData = req.body;

        let clientData;
        if (req.body.role==='user') {
            const validated = await UserValid.validateAsync(rawData, { stripUnknown: true });
            clientData = await UserService.updateUser(validated);
        }
        else if (req.body.role==='worker') {
            const validated = await WorkerValid.validateAsync(rawData, { stripUnknown: true });
            clientData = await WorkerService.updateUser(validated);
        }
        else if (req.body.role==='admin') {
            const validated = await AdminValid.validateAsync(rawData, { stripUnknown: true });
            clientData = await AdminService.updateAdmin(validated);
        }
        clientData["email"] = req.body.email;
        clientData["role"] = req.body.role;
        return successDataResponse(res, 200, clientData, 'user')
    } catch (err) {
        return failResponse(res, 500, err.message)
    }
}

module.exports = {
    forgotPassword,
    changePassword,
    updateClient,
}