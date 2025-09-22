class ServiceModel {
    constructor(uid, image, serviceType, serviceName) {
        this.uid = uid;
        this.image = image;
        this.serviceType = serviceType;
        this.serviceName = serviceName
    }

    getInfo() {
        throw new Error("Thiếu phương thức getInfo")
    }
}

class CleaningServiceModel extends ServiceModel {
    constructor(uid, image, serviceType, serviceName, tasks) {
        super(uid, image, serviceType, serviceName);
        this.tasks = tasks;
    }

    getInfo() {
        return {
            uid: this.uid,
            image: this.image,
            serviceType: this.serviceType,
            serviceName: this.serviceName,
            image: this.image,
            tasks: this.tasks
        }
    }
}

class HealthcareServiceModel extends ServiceModel {
    constructor(uid, image, serviceType, serviceName, duties, excludedTasks) {
        super(uid, image, serviceType, serviceName);
        this.duties = duties;
        this.excludedTasks = excludedTasks;
    }

    getInfo() {
        return {
            uid: this.uid,
            image: this.image,
            serviceType: this.serviceType,
            serviceName: this.serviceName,
            duties: this.duties,
            excludedTasks: this.excludedTasks
        }
    }
}

class MaintenanceServiceModel extends ServiceModel {
    constructor(uid, image, serviceType, serviceName, powers, isMaintenance, maintenance) {
        super(uid, image, serviceType, serviceName);
        this.powers = powers;
        this.isMaintenance = isMaintenance;
        this.maintenance = maintenance;
    }

    getInfo() {

        const res = [];
        for (let power of this.powers) {
            res.push({
                powerName: power,
                quantity: 0
            })
        }

        return {
            uid: this.uid,
            image: this.image,
            serviceType: this.serviceType,
            serviceName: this.serviceName,
            powers: res,
            isMaintenance: this.isMaintenance,
            maintenance: this.maintenance
        }
    }
}

module.exports = { CleaningServiceModel, HealthcareServiceModel, MaintenanceServiceModel };