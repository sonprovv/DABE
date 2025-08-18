class JobModel {
    constructor(uid, userID, serviceType, workerQuantity, status, price, isWeek, dayOfWeek, createdAt) {
        this.uid = uid;
        this.userID = userID;
        this.serviceType = serviceType;
        this.workerQuantity = workerQuantity;
        this.status = status;
        this.price = price;
        this.isWeek = isWeek;
        this.dayOfWeek = dayOfWeek;
        this.createdAt = createdAt;
    }
}

class CleaningJobModel extends JobModel {
    constructor(uid, userID, serviceType, workerQuantity, status, price, isWeek, dayOfWeek, durationID, services, isCooking, isIroning) {
        super(uid, userID, serviceType, workerQuantity, status, price, isWeek, dayOfWeek);
        this.durationID = durationID;
        this.services = services; //List serviceID
        this.isCooking = isCooking;
        this.isIroning = this.isIroning;
    }
}

class HealthcareJobModel extends JobModel {
    constructor(uid, userID, serviceType, workerQuantity, status, price, isWeek, dayOfWeek, shiftID, isWeek, services) {
        super(uid, userID, serviceType, workerQuantity, status, price, isWeek, dayOfWeek);
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