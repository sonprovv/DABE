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

const getClient = async (account) => {
    let currentClient;
    if (account.role==='user') {
        const client = await UserService.getByUID(account.uid);
        currentClient = new UserModel(
            account.uid,
            client.username,
            client.gender,
            client.dob,
            client.avatar,
            client.tel,
            client.location,
            account.email,
            account.role,
            account.provider
        )
        return currentClient.getInfo();
    }
    else if (account.role==='admin') {
        const client = await AdminService.getByUID(account.uid);
        currentClient = new AdminModel(
            account.uid,
            client.username,
            client.gender,
            client.dob,
            client.avatar,
            client.tel,
            client.location,
            account.email,
            account.role,
            account.provider
        )
        return currentClient.getInfo();
    }
    else if (account.role==='worker') {
        const client = await WorkerService.getByUID(account.uid);
        currentClient = new WorkerModel(
            account.uid,
            client.username,
            client.gender,
            client.dob,
            client.avatar,
            client.tel,
            client.location,
            account.email,
            account.role,
            account.provider,
            client.description
        )
        return currentClient.getInfo();
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
        const currentClient = await getClient(account)

        return successDataResponse(res, 200, {
            user: currentClient,
            token: idToken,
            refreshToken: refreshToken
        })
    } catch (err) {
        console.log(err.message);
        return failResponse(res, 500, "Không tìm thấy thông tin người dùng")
    }
}

const loginWithGG = async (req, res) => {
    const { token, role } = req.body;

    try {
        const decodedToken = await auth.verifyIdToken(token);
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

        let clientDoc;
        if (role=='user') clientDoc = await db.collection('users').doc(uid).get();
        else if (role=='admin') clientDoc = await db.collection('admins').doc(uid).get();
        else if (role==='worker') clientDoc = await db.collection('workers').doc(uid).get();

        let currentClient;
        if (clientDoc.exists) {
            currentClient = await getClient(currentAccount);
        } else {
            const rawClient = {
                uid: uid,
                avatar: picture ? picture : 'https://res.cloudinary.com/dvofgx21o/image/upload/v1754337546/jobs/byhangkho4twacw1owri.png',
                username: name ? name : email.split('@')[0]
            }

            let validated;
            if (role==='user') {
                validated = await UserValid.validateAsync(rawClient, { stripUnknown: true });
                await UserService.createUser(validated);
            }
            else if (role==='admin') {
                validated = await AdminValid.validateAsync(rawClient, { stripUnknown: true });
                await AdminService.createAdmin(validated);
            }
            else {
                validated = await WorkerValid.validateAsync(rawClient, { stripUnknown: true });
                await WorkerService.createWorker(validated);
            } 

            currentClient = await getClient(currentAccount);
        }

        const response = await axios.post(
            `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${process.env.FB_API_KEY}`,
            { email, password, returnSecureToken: true }
        );

        const { idToken, refreshToken } = response.data;

        return successDataResponse(res, 200, {
            user: currentClient,
            token: idToken,
            refreshToken: refreshToken
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

        const rawClient = {
            uid: authAccount.uid,
            username: authAccount.email.split('@')[0]
        }
        
        const account = await AccountService.createAccount(newAccount);
        if (role=='user') {
            const validated = await UserValid.validateAsync(rawClient, { stripUnknown: true });
            await UserService.createUser(validated);
        }
        if (role=='admin') {
            const validated = await AdminValid.validateAsync(rawClient, { stripUnknown: true });
            await AdminService.createAdmin(validated);
        }
        else {
            const validated = await WorkerValid.validateAsync(rawClient, { stripUnknown: true });
            await WorkerService.createWorker(validated);
        } 

        const currentClient = await getClient(account);

        return successDataResponse(res, 200, {
            user: currentClient,
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