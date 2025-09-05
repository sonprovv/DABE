const UserModel = require("../models/UserModel");
const WorkerModel = require("../models/WorkerModel");
const AccountModel = require("../models/AccountModel");
const UserService = require("../services/UserService");
const AccountService = require("../services/AccountService");
const WorkerService = require("../services/WorkerService");
const { failResponse, successDataResponse, successResponse } = require("../utils/response");
const { UserInfoValid, WorkerInfoValid, UserValid, WorkerValid } = require("../utils/validator/UserValid");
const { ForgotPasswordValid } = require("../utils/validator/AuthValid");
const { auth, db } = require("../config/firebase");
const { default: axios } = require("axios");
const dotenv = require('dotenv');
dotenv.config();

const checkEmailExists = async (email) => {
    if (!email) throw new Error("Không tìm thấy email");

    const snapshot = await db.collection('accounts').where('email', '==', email).limit(1).get;

    return !snapshot.empty;
}

const getUser = async (account) => {
    let currentUser;
    if (account.role==='user' || account.role==='admin') {
        const user = await UserService.getByUID(account.uid);
        // Ensure dob is a string (convert Date to ISO string if it's a Date object)
        const formattedDob = user.dob ? (user.dob.toDate ? user.dob.toDate().toISOString().split('T')[0] : user.dob) : null;
        
        currentUser = new UserModel(
            account.uid,
            user.username,
            user.gender,
            formattedDob, // Use the formatted date string
            user.avatar,
            user.tel,
            user.location,
            account.email,
            account.role
        )
        return currentUser.getInfo();
    }
    else if (account.role==='worker') {
        const user = await WorkerService.getByUID(account.uid);
        // Ensure dob is a string (convert Date to ISO string if it's a Date object)
        const formattedDob = user.dob ? (user.dob.toDate ? user.dob.toDate().toISOString().split('T')[0] : user.dob) : null;
        
        currentUser = new WorkerModel(
            account.uid,
            user.username,
            user.gender,
            formattedDob, // Use the formatted date string
            user.avatar,
            user.tel,
            user.location,
            account.email,
            account.role,
            user.description
        )
        return currentUser.getInfo();
    }
}

const getMe = async (req, res) => {
    try {
        // Get the token from the Authorization header
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return failResponse(res, 401, 'No token provided');
        }

        // Verify the token
        const decoded = await auth.verifyIdToken(token);
        const uid = decoded.uid;

        // Get user account and data
        const account = await AccountService.getByUID(uid);
        if (!account) {
            return failResponse(res, 404, 'User not found');
        }
        
        const currentUser = await getUser(account);

        return successDataResponse(res, 200, {
            user: currentUser,
            token: token
        })
    } catch (err) {
        console.log(err.message);
        return failResponse(res, 400, "Không tìm thấy thông tin người dùng")
    }
}

const loginWithGG = async (req, res) => {
    const { idToken, role } = req.body;

    try {
        const decodedToken = await auth.verifyIdToken(idToken);
        let { uid, email, name, picture } = decodedToken;

        const emailExists = await checkEmailExists(email);
        if (emailExists) {
            const accountSnapshot = await db.collection('accounts')
                .where('email', '==', email)
                .limit(1)
                .get();
            
            const existingAccount = accountSnapshot.docs[0]?.data();
            if (existingAccount && existingAccount.provider !== 'google.com') {
                return failResponse(res, 400, `Email này đã được đăng ký với ${existingAccount.provider}. Vui lòng đăng nhập bằng ${existingAccount.provider}`);
            }
        }

        const userDoc = await db.collection('users').doc(uid).get();
        const accountDoc = await db.collection('accounts').doc(uid).get();

        let currentAccount;
        if (accountDoc.exists) {
            currentAccount = { uid: accountDoc.id, ...accountDoc.data() };
        } else {
            const newAccount = new AccountModel(
                uid,
                email,
                role,
                'google.com'
            )

            await AccountService.createAccount(newAccount);
            currentAccount = newAccount;
        }

        console.log("Current account: ", currentAccount);

        let currentUser;
        if (userDoc.exists) {
            currentUser = { uid: userDoc.id, ...userDoc.data() };
        } else {
            const rawUser = {
                uid: uid,
                avatar: picture ? picture : 'https://res.cloudinary.com/dvofgx21o/image/upload/v1754337546/jobs/byhangkho4twacw1owri.png',
                username: name ? name : email.split('@')[0]
            }

            let validated;
            if (role=='user') {
                validated = await UserValid.validateAsync(rawUser, { stripUnknown: true });
                await UserService.createUser(validated);
            }
            else {
                validated = await WorkerValid.validateAsync(rawUser, { stripUnknown: true });
                await WorkerService.createWorker(validated);
            } 

            currentUser = await getUser(currentAccount);
        }

        console.log("Current user: ", currentUser);

        return successDataResponse(res, 200, {
            user: currentUser,
            token: idToken
        })
    } catch (err) {
        console.log(err.message);
        return failResponse(res, 400, "Không thành công")
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
            role,
            'normal'
        );

        const rawUser = {
            uid: authAccount.uid,
            avatar: avatar ? avatar : 'https://res.cloudinary.com/dvofgx21o/image/upload/v1754337546/jobs/byhangkho4twacw1owri.png',
            username: username ? username : authAccount.email.split('@')[0]
        }
        
        const account = await AccountService.createAccount(newAccount);
        if (role=='user') {
            const validated = await UserValid.validateAsync(rawUser, { stripUnknown: true });
            await UserService.createUser(validated);
            
        }
        else {
            const validated = await WorkerValid.validateAsync(rawUser, { stripUnknown: true });
            await WorkerService.createWorker(validated);
        } 

        const currentUser = await getUser(account);

        return successDataResponse(res, 200, {
            user: currentUser,
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
    getMe,
    loginWithGG,
    createUser,
    forgotPassword,
    changePassword,
    updateUser,
    deleteUser
}