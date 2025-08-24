const { db } = require("../config/firebase");

class UserService {
    constructor() {}

    async getByUID(uid) {
        try {
            const userDoc = await db.collection('users').doc(uid).get();

            if (!userDoc.exists) {
                throw new Error("Người dùng không tồn tại")
            }

            return { uid: uid, ...userDoc.data() };
        } catch (err) {
            console.error(err.message);
            throw new Error("Không tìm thấy thông tin")
        }
    }

    async createUser(validated) {
        const {uid, ...data} = validated;
        try {
            await db.collection('users').doc(uid).set(data);

            return validated;
        } catch (err) {
            console.error(err.message);
            throw new Error("Đăng ký không thành công")
        }
    }

    async updateUser(validated) {
        const {uid, ...data} = validated;
        try {
            const userRef = db.collection('users').doc(uid);
            await userRef.update(data);

            const updatedUser = await userRef.get();

            return updatedUser;
        } catch (err) {
            console.error(err.message);
            throw new Error("Cập nhật không thành công")
        }
    }

    async deleteUser(uid) {
        try {
            const userRef = db.collection('users').doc(uid);
            await userRef.delete();
        } catch (err) {
            console.error(err.message);
            throw new Error("Xóa người dùng không thành công")
        }
    }
}

module.exports = new UserService();