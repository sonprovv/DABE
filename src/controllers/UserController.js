const UserModel = require("../models/UserModel");
const WorkerModel = require("../models/WorkerModel");
const AccountModel = require("../models/AccountModel");
const UserService = require("../services/UserService");
const AccountService = require("../services/AccountService");
const WorkerService = require("../services/WorkerService");
const { failResponse, successDataResponse, successResponse } = require("../utils/response");
const { UserValid, WorkerValid, UserInfoValid, WorkerInfoValid } = require("../utils/validator/UserValid");
const { ForgotPasswordValid } = require("../utils/validator/AuthValid");
const { auth } = require("../config/firebase");
const { default: axios } = require("axios");
const dotenv = require('dotenv');
dotenv.config();

const loginWithGG = async (req, res) => {
    try {
        const code = req.body.code;

        const tokenRes = await axios.post("https://oauth2.googleapis.com/token", {
            code,
            client_id: sfrb
        })
    } catch (err) {
        console.log(err.message);
        return failResponse(res, 400, "Không thành công")
    }
}

const getMe = async (req, res) => {
    try {
        // const uid = req.user.uid;

        const { email, password } = req.body;
        const response = await axios.post(
            `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${process.env.FB_API_KEY}`,
            { email, password, returnSecureToken: true }
        );

        const token = response.data.idToken;
        const decoded = await auth.verifyIdToken(token);

        const uid = decoded.uid;

        const account = await AccountService.getByUID(uid);
        let currentUser;
        if (account.role==='user' || account.role==='admin') {
            const user = await UserService.getByUID(uid);
            currentUser = new UserModel(
                uid,
                user.username,
                user.gender,
                user.dob,
                user.avatar,
                user.tel,
                user.location,
                account.email,
                account.role
            )
        }
        else if (account.role==='worker') {
            const user = await WorkerService.getByUID(uid);
            currentUser = new WorkerModel(
                uid,
                user.username,
                user.gender,
                user.dob,
                user.avatar,
                user.tel,
                user.location,
                account.email,
                account.role,
                user.description
            )
        }

        return successDataResponse(res, 200, {
            user: currentUser.getInfo(),
            token: token
        })
    } catch (err) {
        console.log(err.message);
        return failResponse(res, 400, "Không tìm thấy thông tin người dùng")
    }
}

const createUser = async (req, res) => {
    try {
        const { email, password, username, avatar, role } = req.body;

        const authAccount = await auth.createUser({
            email,
            password
        })

        const response = await axios.post(
            `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${process.env.FB_API_KEY}`,
            { email, password, returnSecureToken: true }
        );

        const token = response.data.idToken;

        const newAccount = new AccountModel(
            authAccount.uid,
            authAccount.email,
            role
        );

        const rawUser = {
            uid: authAccount.uid,
            avatar: avatar ? avatar : 'https://res.cloudinary.com/dvofgx21o/image/upload/v1754337546/jobs/byhangkho4twacw1owri.png',
            username: username ? username : authAccount.email.split('@')[0]
        }
        
        const account = await AccountService.createAccount(newAccount);
        let newUser;
        if (role==='user' || role==='admin') {
            const validated = await UserValid.validateAsync(rawUser, { stripUnknown: true });
            const user = await UserService.createUser(validated);
            newUser = new UserModel(
                user.uid,
                user.username,
                user.gender,
                user.dob,
                user.avatar,
                user.tel,
                user.location,
                account.email,
                account.role
            )
        }
        else if (role==='worker') {
            const validated = await WorkerValid.validateAsync(rawUser, { stripUnknown: true });
            const user = await WorkerService.createWorker(validated);
            newUser = new WorkerModel(
                user.uid,
                user.username,
                user.gender,
                user.dob,
                user.avatar,
                user.tel,
                user.location,
                account.email,
                account.role,
                user.description
            )
        }

        return successDataResponse(res, 200, {
            user: newUser,
            token: token
        })

    } catch (err) {
        console.log(err);
        return failResponse(res, 500, "Đăng ký thất bại")
    }
}

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
        return failResponse(res, 400, err.message)
    }
}

const changePassword = async (req, res) => {
    try {
        const emailToken = req.user.email;
        const rawData = req.body;
        const validated = await ForgotPasswordValid.validateAsync({email: emailToken, ...rawData}, { stripUnknown: true });

        const userRecord = await auth.getUserByEmail(validated.email);
        await auth.updateUser(userRecord.uid, {
            password: validated.newPassword
        })

        return successResponse(res, 200, "Mật khẩu đã được thay đổi")

    } catch (err) {
        return failResponse(res, 400, err.message)
    }
}

const updateUser = async (req, res) => {
    try {
        const rawData = req.body;

        const allowedRoles = ['user', 'worker'];
        if (!allowedRoles.includes(req.body.role)) {
            return failResponse(res, 400, "Role không hợp lệ");
        }

        let userData;
        if (req.body.role==='user') {
            const validated = await UserInfoValid.validateAsync(rawData, { stripUnknown: true });
            userData = await UserService.updateUser(validated);
        }
        else {
            const validated = await WorkerInfoValid.validateAsync(rawData, { stripUnknown: true });
            userData = await WorkerService.updateUser(validated);
        }
        userData["email"] = req.body.email;
        userData["role"] = req.body.role;
        return successDataResponse(res, 200, userData, 'user')
    } catch (err) {
        return failResponse(res, 400, err.message)
    }
}

const deleteUser = async (req, res) => {
    try {
        const rawData = req.body;

        const allowedRoles = ['user', 'worker'];
        if (!allowedRoles.includes(req.body.role)) {
            return failResponse(res, 400, "Role không hợp lệ");
        }

        if (req.body.role==='user') {
            const validated = await UserInfoValid.validateAsync(rawData, { stripUnknown: true });
            await UserService.deleteUser(validated.uid);
        }
        else {
            const validated = await WorkerInfoValid.validateAsync(rawData, { stripUnknown: true });
            await WorkerService.deleteUser(validated.uid);
        }
        return successResponse(res, 200, "Xóa người dùng thành công")
    } catch (err) {
        return failResponse(res, 400, err.message)
    }
}

module.exports = {
    loginWithGG,
    getMe,
    createUser,
    forgotPassword,
    changePassword,
    updateUser,
    deleteUser
}