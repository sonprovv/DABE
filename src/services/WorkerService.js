const { db } = require("../config/firebase");
const { formatDate } = require("../utils/formatDate");
const AccountService = require("./AccountService");

class WorkerService {
    constructor() {}

    async getByUID(uid) {
        try {
            const workerDoc = await db.collection('workers').doc(uid).get();

            if (!workerDoc.exists) {
                throw new Error("Người dùng không tồn tại")
            }

            const accountDoc = await AccountService.getByUID(uid);
            const workerData = workerDoc.data();
            workerData['dob'] = formatDate(typeof workerData.dob.toDate==='function' ? workerData.dob.toDate() : workerData.dob);
            workerData['email'] = accountDoc.email;
            workerData['role'] = accountDoc.role;

            return { uid: uid, ...workerData };
        } catch (err) {
            console.error(err.message);
            throw new Error("Không tìm thấy thông tin")
        }
    }

    async createWorker(validated) {
        const {uid, ...data} = validated;
        try {
            await db.collection('workers').doc(uid).set(data);
        } catch (err) {
            console.error(err.message);
            throw new Error("Đăng ký không thành công")
        }
    }

    async updateUser(validated) {
        const {uid, ...data} = validated;
        try {
            const userRef = db.collection('workers').doc(uid);
            await userRef.update(data);

            const updatedUser = await userRef.get();

            return { uid: uid, ...updatedUser.data() };
        } catch (err) {
            console.error(err.message);
            throw new Error("Cập nhật không thành công")
        }
    }

    async deleteUser(uid) {
        try {
            const userRef = db.collection('workers').doc(uid);
            await userRef.delete();
        } catch (err) {
            console.error(err.message);
            throw new Error("Xóa người dùng không thành công")
        }
    }
}

module.exports = new WorkerService();