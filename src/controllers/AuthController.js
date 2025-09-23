const UserModel = require("../models/UserModel");
const WorkerModel = require("../models/WorkerModel");
const AccountModel = require("../models/AccountModel");
const UserService = require("../services/UserService");
const AccountService = require("../services/AccountService");
const WorkerService = require("../services/WorkerService");
const { failResponse, successDataResponse } = require("../utils/response");
const { UserValid, WorkerValid, AdminValid } = require("../utils/validator/UserValid");
const { auth, db } = require("../config/firebase");
const { default: axios } = require("axios");
const dotenv = require('dotenv');
const AdminService = require("../services/AdminService");
const AdminModel = require("../models/AdminModel");
dotenv.config();

const checkEmailExists = async (email) => {
    if (!email) throw new Error("Không tìm thấy email");

    const snapshot = await db.collection('accounts').where('email', '==', email).limit(1).get;

    return !snapshot.empty;
}

const getUser = async (account) => {
    let currentUser;
    if (account.role==='user') {
        const user = await UserService.getByUID(account.uid);
        currentUser = new UserModel(
            account.uid,
            user.username,
            user.gender,
            user.dob,
            user.avatar,
            user.tel,
            user.location,
            account.email,
            account.role,
            account.provider
        )
        return currentUser.getInfo();
    }
    if (account.role==='admin') {
        const user = await AdminService.getByUID(account.uid);
        currentUser = new AdminModel(
            account.uid,
            user.username,
            user.gender,
            user.dob,
            user.avatar,
            user.tel,
            user.location,
            account.email,
            account.role,
            account.provider
        )
        return currentUser.getInfo();
    }
    else if (account.role==='worker') {
        const user = await WorkerService.getByUID(account.uid);
        currentUser = new WorkerModel(
            account.uid,
            user.username,
            user.gender,
            user.dob,
            user.avatar,
            user.tel,
            user.location,
            account.email,
            account.role,
            account.provider,
            user.description
        )
        return currentUser.getInfo();
    }
}

const getMe = async (req, res) => {
    try {
        const { email, password } = req.body;
        const response = await axios.post(
            `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${process.env.FB_API_KEY}`,
            { email, password, returnSecureToken: true }
        );

        const { idToken, refreshToken } = response.data;
        
        const decoded = await auth.verifyIdToken(idToken);

        const uid = decoded.uid;

        const account = await AccountService.getByUID(uid);
        const currentUser = await getUser(account)

        return successDataResponse(res, 200, {
            user: currentUser,
            token: idToken,
            refreshToken: refreshToken
        })
    } catch (err) {
        console.log(err.message);
        return failResponse(res, 500, "Không tìm thấy thông tin người dùng")
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
                return failResponse(res, 500, `Email này đã được đăng ký với ${existingAccount.provider}. Vui lòng đăng nhập bằng ${existingAccount.provider}`);
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

        let currentUser;
        if (userDoc.exists) {
            currentUser = await getUser(currentAccount);
        } else {
            const rawUser = {
                uid: uid,
                avatar: picture ? picture : 'https://res.cloudinary.com/dvofgx21o/image/upload/v1754337546/jobs/byhangkho4twacw1owri.png',
                username: name ? name : email.split('@')[0]
            }

            let validated;
            if (role==='user') {
                validated = await UserValid.validateAsync(rawUser, { stripUnknown: true });
                await UserService.createUser(validated);
            }
            else {
                validated = await WorkerValid.validateAsync(rawUser, { stripUnknown: true });
                await WorkerService.createWorker(validated);
            } 

            currentUser = await getUser(currentAccount);
        }

        return successDataResponse(res, 200, {
            user: currentUser,
            token: idToken
        })
    } catch (err) {
        console.log(err.message);
        return failResponse(res, 500, "Không thành công")
    }
}

const createUser = async (req, res) => {
    try {
        const { email, password, confirmPassword, role } = req.body;

        if (password.length < 6 || password.length > 10) throw new Error('Mật khẩu từ 6-10 ký tự');
        if (password!==confirmPassword) throw new Error('Mật khẩu không trùng khớp');

        const authAccount = await auth.createUser({
            email,
            password
        })

        const response = await axios.post(
            `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${process.env.FB_API_KEY}`,
            { email, password, returnSecureToken: true }
        );

        const { idToken, refreshToken } = response.data;

        const newAccount = new AccountModel(
            authAccount.uid,
            authAccount.email,
            role,
            'normal'
        );

        const rawUser = {
            uid: authAccount.uid,
            username: authAccount.email.split('@')[0]
        }
        
        const account = await AccountService.createAccount(newAccount);
        if (role=='user') {
            const validated = await UserValid.validateAsync(rawUser, { stripUnknown: true });
            await UserService.createUser(validated);
        }
        if (role=='admin') {
            const validated = await AdminValid.validateAsync(rawUser, { stripUnknown: true });
            await AdminService.createAdmin(validated);
        }
        else {
            const validated = await WorkerValid.validateAsync(rawUser, { stripUnknown: true });
            await WorkerService.createWorker(validated);
        } 

        const currentUser = await getUser(account);

        return successDataResponse(res, 200, {
            user: currentUser,
            token: idToken,
            refreshToken: refreshToken
        })

    } catch (err) {
        console.log(err);
        return failResponse(res, 500, err.message)
    }
}

const refreshIdToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;

        const response = await axios.post(`https://securetoken.googleapis.com/v1/token?key=${process.env.FB_API_KEY}`, 
            new URLSearchParams({
                grant_type: 'refresh_token',
                refresh_token: refreshToken
            })
        )

        const { id_token, refresh_token } = response.data;

        return successDataResponse(res, 200, {
            idToken: id_token,
            refreshToken: refresh_token
        })
    } catch (err) {
        console.log(err);
        return failResponse(res, 500, "Lấy lại token thất bại")
    }
}

module.exports = {
    getMe,
    loginWithGG,
    createUser,
    refreshIdToken
}