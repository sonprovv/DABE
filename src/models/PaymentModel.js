const { formatDateAndTime } = require("../utils/formatDate");

class PaymentModel {
    constructor(data) {
        this.uid = data.uid,
        this.jobID = data.jobID,
        this.userID = data.userID,
        this.amount = data.amount,
        this.serviceType = data.serviceType,
        this.createdAt = data.createdAt
    }

    getInfo() {
        return {
            uid: this.uid,
            jobID: this.jobID,
            userID: this.userID,
            amount: this.amount,
            serviceType: this.serviceType,
            createdAt: formatDateAndTime(typeof this.createdAt.toDate==='function' ? this.createdAt.toDate() : this.createdAt)
        }
    }
}

module.exports = PaymentModel;