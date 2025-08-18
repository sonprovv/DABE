const { db } = require("../config/firebase");
const { CleaningServiceModel, HealthcareServiceModel } = require("../models/ServiceModel");
const { CleaningServiceValid, HealthcareServiceValid } = require("../utils/validator/ServiceValid");

class ServiceService {
    constructor() {}

    async getCleaningServiceByUID(uid) {
        try {
            const serviceDoc = await db.collection('cleaningServices').doc(uid).get();

            if (!serviceDoc.exists) {
                throw new Error("Không tìm thấy thông tin");
            }

            return { uid, ...serviceDoc.data() };
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

            return { uid, ...healthcareDoc.data() };
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
                    doc.data().serviceType,
                    doc.data().serviceName,
                    doc.data().image,
                    doc.data().tasks
                );
                const validated = await CleaningServiceValid.validateAsync(serviceDoc, { stripUnknown: true });
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
                    doc.data().serviceType,
                    doc.data().serviceName,
                    doc.data().duties,
                    doc.data().excludedTasks
                );
                const validated = await HealthcareServiceValid.validateAsync(serviceDoc, { stripUnknown: true });
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