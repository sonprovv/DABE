class OrderModel {
    constructor(uid, workerID, jobID, isReview, status, createdAt, serviceType) {
        this.uid = uid;
        this.workerID = workerID;
        this.jobID = jobID;
        this.isReview = isReview;
        this.status = status;
        this.createdAt = createdAt;
        this.serviceType = serviceType;
    }
}

module.exports = OrderModel;