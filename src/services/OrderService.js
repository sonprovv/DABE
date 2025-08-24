const { db } = require("../config/firebase");
const AccountService = require("./AccountService");
const JobService = require("./JobService");
const WorkerService = require("./WorkerService");

class OrderService {
    constructor() {}

    async createOrder(data) {
        try {
            const docRef = await db.collection('orders').add(data);

            return { uid: docRef.id, ...data }
        } catch (err) {
            console.log(err.message);
            throw new Error("Tạo order không thành công")
        }
    }

    async getOrdersByWorkerID(workerID) {
        try {
            const snapshot = await db.collection('orders').where('workerID', '==', workerID).get();
            const orders = [];
            for (const doc of snapshot.docs) {
                const jobDoc = await JobService.getByUID(doc.data().jobID, doc.data().serviceType);

                const tmp = {
                    status: doc.data().status,
                    job: jobDoc
                }
                orders.push(tmp);
            }

            return orders;
        } catch (err) {
            console.log(err.message);
            throw new Error("Thất bại")
        }
    }

    async getOrdersByJobID(jobID) {
        try {
            const snapshot = await db.collection('orders').where('jobID', '==', jobID).get();
            const orders = [];
            for (const doc of snapshot.docs) {
                const accountDoc = await AccountService.getByUID(doc.data().workerID);
                const workerDoc = await WorkerService.getByUID(doc.data().workerID);

                workerDoc['email'] = accountDoc.email;
                workerDoc['role'] = accountDoc.role;

                const tmp = {
                    status: doc.data().status,
                    worker: workerDoc
                }
                orders.push(tmp);
            }

            return orders;
        } catch (err) {
            console.log(err.message);
            throw new Error("Thất bại")
        }
    }

    async putByUID(uid, status) {
        try {
            const orderRef = db.collection('orders').doc(uid);
            orderRef.update({
                status: status
            })

            const updatedOrder = await orderRef.get();

            return { uid: uid, ...updatedOrder};
        } catch (err) {
            console.log(err.message);
            throw new Error("Thất bại")
        }
    }
}

module.exports = new OrderService();