class ServiceModel {
    constructor(data) {
        this.uid = data.uid;
        this.image = data.image;
        this.serviceType = data.serviceType;
        this.serviceName = data.serviceName
    }

    getInfo() {
        return {
            uid: this.uid,
            image: this.image,
            serviceType: this.serviceType,
            serviceName: this.serviceName,
        }
    }
}

class CleaningServiceModel extends ServiceModel {
    constructor(data) {
        super(data);
        this.tasks = data.tasks;
    }

    getInfo() {
        return {
            ...super.getInfo(),
            tasks: this.tasks
        }
    }
}

class HealthcareServiceModel extends ServiceModel {
    constructor(data) {
        super(data);
        this.duties = data.duties;
        this.excludedTasks = data.excludedTasks;
    }

    getInfo() {
        return {
            ...super.getInfo(),
            duties: this.duties,
            excludedTasks: this.excludedTasks
        }
    }
}

class MaintenanceServiceModel extends ServiceModel {
    constructor(data) {
        super(data);
        this.powers = data.powers;
        this.maintenance = data.maintenance;
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
            ...super.getInfo(),
            powers: res,
            maintenance: this.maintenance
        }
    }
}

module.exports = { CleaningServiceModel, HealthcareServiceModel, MaintenanceServiceModel };