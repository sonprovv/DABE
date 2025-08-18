const { db } = require("../config/firebase");

class AccountService {
    constructor() {}

    async getByUID(uid) {
        try {
            const accountDoc = await db.collection('accounts').doc(uid).get();

            if (!accountDoc.exists) {
                throw new Error("Tài khoản không tồn tại")
            }

            const accountData = accountDoc.data();

            return accountData;
        } catch (err) {
            console.error(err);
            throw new Error("Không tìm thấy tài khoản")
        }
    }

    async createAccount(validated) {
        const {uid, ...data} = validated;

        try {
            await db.collection('accounts').doc(uid).set(data);

            return validated;
        } catch (err) {
            console.error(err.message);
            throw new Error("Đăng ký không thành công")
        }
    }
}

module.exports = new AccountService();