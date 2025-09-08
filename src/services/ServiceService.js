const { db } = require("../config/firebase");
const { CleaningServiceModel, HealthcareServiceModel, MaintenanceServiceModel } = require("../models/ServiceModel");
const { CleaningServiceValid, HealthcareServiceValid, MaintenanceServiceValid } = require("../utils/validator/ServiceValid");

class ServiceService {
    constructor() {}

    async getCleaningServiceByUID(uid) {
        try {
            const serviceDoc = await db.collection('cleaningServices').doc(uid).get();

            if (!serviceDoc.exists) {
                throw new Error("Không tìm thấy thông tin");
            }

            return { uid: uid, ...serviceDoc.data() };
        } catch (err) {
            console.log(err.message);
            throw new Error("Không tìm thấy thông tin");
        }
    }

    async getHealthcareServiceByUID(uid) {
        try {
            const healthcareDoc = await db.collection('healthcareServices').doc(uid).get();

            if (!healthcareDoc.exists) {
                throw new Error("Không tìm thấy thông tin");
            }

            return { uid: uid, ...healthcareDoc.data() };
        } catch (err) {
            console.log(err.message);
            throw new Error("Không tìm thấy thông tin");
        }
    }

    async getCleaningService() {
        try {
            const snapshot = await db.collection('cleaningServices').get();
            const services = [];

            for (const doc of snapshot.docs) {
                const serviceDoc = new CleaningServiceModel(
                    doc.id,
                    doc.data().image,
                    doc.data().serviceType,
                    doc.data().serviceName,
                    doc.data().tasks
                );
                const validated = await CleaningServiceValid.validateAsync(serviceDoc.getInfo(), { stripUnknown: true });
                services.push(validated);
            }

            return services;
        } catch (err) {
            console.log(err.message);
            throw new Error("Không tìm thấy thông tin");
        }
    }

    async getHealthcareService() {
        try {
            const snapshot = await db.collection('healthcareServices').get();
            const services = [];

            for (const doc of snapshot.docs) {
                const serviceDoc = new HealthcareServiceModel(
                    doc.id,
                    doc.data().image,
                    doc.data().serviceType,
                    doc.data().serviceName,
                    doc.data().duties,
                    doc.data().excludedTasks
                );
                const validated = await HealthcareServiceValid.validateAsync(serviceDoc.getInfo(), { stripUnknown: true });
                services.push(validated);
            }

            return services;
        } catch (err) {
            console.log(err.message);
            throw new Error("Không tìm thấy thông tin");
        }
    }

    async getMaintenanceService() {
         try {
            const snapshot = await db.collection('maintenanceServices').get();
            const services = [];

            for (const doc of snapshot.docs) {
                const serviceDoc = new MaintenanceServiceModel(
                    doc.id,
                    doc.data().image,
                    doc.data().serviceType,
                    doc.data().serviceName,
                    doc.data().powers,
                    doc.data().isMaintenance,
                    doc.data().maintenance
                );
                const validated = await MaintenanceServiceValid.validateAsync(serviceDoc.getInfo(), { stripUnknown: true });
                services.push(validated);
            }

            return services;
        } catch (err) {
            console.log(err.message);
            throw new Error("Không tìm thấy thông tin");
        }
    }
}

module.exports = new ServiceService();