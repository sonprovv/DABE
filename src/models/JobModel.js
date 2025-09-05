class JobModel {
    constructor(uid, userID, startTime, serviceType, workerQuantity, price, isWeek, listDays, createdAt, status) {
        this.uid = uid;
        this.userID = userID;
        this.startTime = startTime;
        this.serviceType = serviceType;
        this.workerQuantity = workerQuantity;
        this.price = price;
        this.isWeek = isWeek;
        this.listDays = listDays;
        this.createdAt = createdAt;
        this.status = status;
    }
}

class CleaningJobModel extends JobModel {
    constructor(uid, userID, startTime, serviceType, workerQuantity, price, isWeek, listDays, createdAt, status, durationID, services, isCooking, isIroning) {
        super(uid, userID, startTime, serviceType, workerQuantity, price, isWeek, listDays, createdAt, status);
        this.durationID = durationID;
        this.services = services;
        this.isCooking = isCooking;
        this.isIroning = isIroning;
    }
}

class HealthcareJobModel extends JobModel {
    constructor(uid, userID, startTime, serviceType, workerQuantity, price, isWeek, listDays, createdAt, status, shiftID, isWeek, services) {
        super(uid, userID, startTime, serviceType, workerQuantity, price, isWeek, listDays, createdAt, status);
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