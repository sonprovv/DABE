const { db } = require("../config/firebase");

class AdminService {
    constructor() {}

    async getByUID(uid) {
        try {
            const adminDoc = await db.collection('admins').doc(uid).get();

            if (!adminDoc.exists) {
                throw new Error("Người dùng không tồn tại")
            }

            return { uid: uid, ...adminDoc.data() };
        } catch (err) {
            console.error(err.message);
            throw new Error("Không tìm thấy thông tin")
        }
    }

    async createAdmin(validated) {
        const {uid, ...data} = validated;
        try {
            await db.collection('admins').doc(uid).set(data);
        } catch (err) {
            console.error(err.message);
            throw new Error("Đăng ký không thành công")
        }
    }

    async updateAdmin(validated) {
        const {uid, ...data} = validated;
        try {
            const adminRef = db.collection('admins').doc(uid);
            await adminRef.update(data);

            await adminRef.get();

            return validated;
        } catch (err) {
            console.error(err.message);
            throw new Error("Cập nhật không thành công")
        }
    }
}

module.exports = new AdminService();