const { db } = require("../config/firebase");
const PaymentModel = require("../models/PaymentModel");

class PaymentService {
    constructor() {}

    async createPayment(userID, jobID, amount, serviceType) {
        try {
            await db.collection('payments').add({
                userID: userID,
                jobID: jobID,
                amount: amount,
                serviceType: serviceType,
                createdAt: new Date()
            })
        } catch (err) {
            console.log(err.message);
            throw new Error('Tạo thanh toán không thành công');
        }
    }

    async getPayments() {
        try {
            const snapshot = await db.collection('payments').get();
            const payments = [];

            snapshot.docs.map(doc => {
                payments.push(
                    (new PaymentModel({ uid: doc.id, ...doc.data() })).getInfo()
                )
            })

            return payments;

        } catch (err) {
            console.log(err.message);
            throw new Error('Không tìm thấy payments');
        }
    }

    async updatePayment(orderID) {
        try {
            const orderDoc = await db.collection('orders').doc(orderID).get();
            if (!orderDoc.exists) throw new Error('Order không tồn tại');

            await db.collection('orders').doc(orderDoc).update({
                isPayment: true
            })
        } catch (err) {
            throw new Error('Cập nhật không thành công')
        }
    }
}

module.exports = new PaymentService();