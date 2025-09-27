const { db } = require("../config/firebase");

class PaymentService {
    constructor() {}

    async createPayment(userID, jobID, serviceType) {
        try {
            await db.collection('payments').add({
                userID: userID,
                jobID: jobID,
                serviceType: serviceType,
                createdAt: new Date()
            })
        } catch (err) {
            console.log(err.message);
            throw new Error('Tạo thanh toán không thành công');
        }
    }
}

module.exports = new PaymentService();