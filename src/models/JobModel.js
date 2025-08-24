class JobModel {
    constructor(uid, userID, serviceType, startTime, endTime, workerQuantity, price, isWeek, dayOfWeek, createdAt, status) {
        this.uid = uid;
        this.userID = userID;
        this.serviceType = serviceType;
        this.startTime = startTime;
        this.endTime = endTime;
        this.workerQuantity = workerQuantity;
        this.price = price;
        this.isWeek = isWeek;
        this.dayOfWeek = dayOfWeek;
        this.createdAt = createdAt;
        this.status = status;
    }
}

class CleaningJobModel extends JobModel {
    constructor(uid, userID, serviceType, startTime, endTime, workerQuantity, price, isWeek, dayOfWeek, createdAt, status, durationID, services, isCooking, isIroning) {
        super(uid, userID, serviceType, startTime, endTime, workerQuantity, price, isWeek, dayOfWeek, createdAt, status);
        this.durationID = durationID;
        this.services = services;
        this.isCooking = isCooking;
        this.isIroning = isIroning;
    }
}

class HealthcareJobModel extends JobModel {
    constructor(uid, userID, serviceType, startTime, endTime, workerQuantity, price, isWeek, dayOfWeek, createdAt, status, shiftID, isWeek, services) {
        super(uid, userID, serviceType, startTime, endTime, workerQuantity, price, isWeek, dayOfWeek, createdAt, status);
        this.shiftID = shiftID;
        this.services = services;
    }
}

class HealthcareDetailsModel {
    constructor(uid, healthcareServiceID, quantity) {
        this.uid = uid;
        this.healthcareServiceID = healthcareServiceID;
        this.quantity = quantity;
    }
}

module.exports = {
    CleaningJobModel,
    HealthcareJobModel,
    HealthcareDetailsModel
}