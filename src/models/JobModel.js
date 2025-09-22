class JobModel {
    constructor(uid, userID, startTime, serviceType, price, listDays, createdAt, status, location) {
        this.uid = uid;
        this.userID = userID;
        this.startTime = startTime;
        this.serviceType = serviceType;
        this.price = price;
        this.listDays = listDays;
        this.createdAt = createdAt;
        this.status = status;
        this.location = location;
    }
}

class CleaningJobModel extends JobModel {
    constructor(uid, userID, startTime, serviceType, price, listDays, createdAt, status, location, durationID, isCooking, isIroning) {
        super(uid, userID, startTime, serviceType, price, listDays, createdAt, status, location);
        this.durationID = durationID;
        this.isCooking = isCooking;
        this.isIroning = isIroning;
    }
}

class HealthcareJobModel extends JobModel {
    constructor(uid, userID, startTime, serviceType, price, listDays, createdAt, status, location, shiftID, isWeek, services) {
        super(uid, userID, startTime, serviceType, price, listDays, createdAt, status, location);
        this.shiftID = shiftID;
        this.services = services;
    }
}

module.exports = {
    CleaningJobModel,
    HealthcareJobModel,
}