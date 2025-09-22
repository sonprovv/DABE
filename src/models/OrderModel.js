class OrderModel {
    constructor(uid, workerID, jobID, isReview, status, serviceType) {
        this.uid = uid;
        this.workerID = workerID;
        this.jobID = jobID;
        this.isReview = isReview;
        this.status = status;
        this.serviceType = serviceType;
    }
}

module.exports = OrderModel;