class ReviewModel {
    constructor(uid, userID, workerID, orderID, rating, comment, serviceType) {
        this.uid = uid;
        this.userID = userID,
        this.workerID = workerID,
        this.orderID = orderID,
        this.rating = rating,
        this.comment = comment,
        this.serviceType = serviceType
    }
}

module.exports = ReviewModel;