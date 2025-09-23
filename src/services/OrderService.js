const { db } = require("../config/firebase");
const { formatDate } = require("../utils/formatDate");
const AccountService = require("./AccountService");
const JobService = require("./JobService");
const ReviewService = require("./ReviewService");
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

    async checkOrder(workerID, jobID) {
        const orderRef = await db.collection('orders')
            .where('workerID', '==', workerID)
            .where('jobID', '==', jobID)
            .get()
        
        if (orderRef.empty) return true;
        return false;
    }

    async getOrders() {
        try {
            const snapshot = await db.collection('orders').get();

            const orders = [];
            snapshot.docs.map(doc => {
                orders.push({ uid: doc.id, ...doc.data() });
            })

            return orders;
        } catch (err) {
            console.log(err.message);
            throw new Error("Get order không thành công")
        }
    }

    async getOrdersByWorkerID(workerID) {
        try {
            const snapshot = await db.collection('orders').where('workerID', '==', workerID).get();
            const orders = [];
            await Promise.all(snapshot.docs.map(async (doc) => {
                const jobDoc = await JobService.getByUID(doc.data().jobID, doc.data().serviceType);

                const tmp = {
                    uid: doc.id,
                    job: jobDoc,
                    status: doc.data().status,
                    isReview: doc.data().isReview,
                    isPayment: doc.data().isPayment,
                    price: doc.data().price,
                    createdAt: doc.data().createdAt,
                    serviceType: doc.data().serviceType,
                }

                if (tmp.isReview) {
                    const review = await ReviewService.getReviewByOrderID(tmp.uid);
                    tmp['review'] = review;
                }
                orders.push(tmp);
            }))

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
            await Promise.all(snapshot.docs.map(async (doc) => {
                const accountDoc = await AccountService.getByUID(doc.data().workerID);
                const workerDoc = await WorkerService.getByUID(doc.data().workerID);
                workerDoc['dob'] = formatDate(typeof workerDoc.dob.toDate === 'function' ? workerDoc.dob.toDate() : workerDoc.dob)
                workerDoc['email'] = accountDoc.email;
                workerDoc['role'] = accountDoc.role;

                const tmp = {
                    uid: doc.id,
                    worker: workerDoc,
                    status: doc.data().status,
                    isReview: doc.data().isReview,
                    isPayment: doc.data().isPayment,
                    price: doc.data().price,
                    createdAt: doc.data().createdAt,
                    serviceType: doc.data().serviceType,
                }

                if (tmp.isReview) {
                    const review = await ReviewService.getReviewByOrderID(tmp.uid);
                    tmp['review'] = review;
                }

                orders.push(tmp);
            }))

            return orders;
        } catch (err) {
            console.log(err.message);
            throw new Error("Thất bại")
        }
    }

    async putStatusByUID(uid, status) {
        await db.collection('orders').doc(uid).update({
            status: status
        })

        const updatedOrder = await db.collection('orders').doc(uid).get();

        return { uid: updatedOrder.id, ...updatedOrder.data() }
    }
}

module.exports = new OrderService();