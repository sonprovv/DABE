class ServiceModel {
    constructor(uid, serviceType, serviceName) {
        this.uid = uid;
        this.serviceType = serviceType;
        this.serviceName = serviceName
    }

    getInfo() {
        throw new Error("Thiếu phương thức getInfo")
    }
}

class CleaningServiceModel extends ServiceModel {
    constructor(uid, serviceType, serviceName, image, tasks) {
        super(uid, serviceType, serviceName);
        this.image = image;
        this.tasks = tasks;
    }

    getInfo() {
        return {
            uid: this.uid,
            serviceType: this.serviceType,
            serviceName: this.serviceName,
            image: this.image,
            tasks: this.tasks
        }
    }
}

class HealthcareServiceModel extends ServiceModel {
    constructor(uid, serviceType, serviceName, duties, excludedTasks) {
        super(uid, serviceType, serviceName);
        this.duties = duties;
        this.excludedTasks = excludedTasks;
    }

    getInfo() {
        return {
            uid: this.uid,
            serviceType: this.serviceType,
            serviceName: this.serviceName,
            duties: this.duties,
            excludedTasks: this.excludedTasks
        }
    }
}

module.exports = { CleaningServiceModel, HealthcareServiceModel };