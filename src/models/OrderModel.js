class OrderModel {
    constructor(uid, workerID, jobID, serviceType, status) {
        this.uid = uid;
        this.workerID = workerID;
        this.jobID = jobID;
        this.serviceType = serviceType;
        this.status = status;
    }
}

module.exports = OrderModel;