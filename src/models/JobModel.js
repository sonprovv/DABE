class JobModel {
    constructor(uid, userID, startTime, serviceType, workerQuantity, price, listDays, createdAt, status, location) {
        this.uid = uid;
        this.userID = userID;
        this.startTime = startTime;
        this.serviceType = serviceType;
        this.workerQuantity = workerQuantity;
        this.price = price;
        this.listDays = listDays;
        this.createdAt = createdAt;
        this.status = status;
        this.location = location;
    }
}

class CleaningJobModel extends JobModel {
    constructor(uid, userID, startTime, serviceType, workerQuantity, price, listDays, createdAt, status, location, durationID, services, isCooking, isIroning) {
        super(uid, userID, startTime, serviceType, workerQuantity, price, listDays, createdAt, status, location);
        this.durationID = durationID;
        this.services = services;
        this.isCooking = isCooking;
        this.isIroning = isIroning;
    }
}

class HealthcareJobModel extends JobModel {
    constructor(uid, userID, startTime, serviceType, workerQuantity, price, listDays, createdAt, status, location, shiftID, isWeek, services) {
        super(uid, userID, startTime, serviceType, workerQuantity, price, listDays, createdAt, status, location);
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