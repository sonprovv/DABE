const { db } = require("../config/firebase");
const { formatDate } = require("../utils/formatDate");
const { CleaningJobGetvalid, HealthcareJobGetValid, MaintenanceJobGetValid } = require("../utils/validator/JobValid");
const TimeService = require("./TimeService");
const UserService = require("./UserService");

class JobService {
    constructor() {}

    async checkServiceType(uid, serviceType) {
        const db_name = `${serviceType.toLowerCase()}Jobs`;
        const job = await db.collection(db_name).doc(uid).get();

        if (job.exists && job.data().serviceType===serviceType) {
            return true;
        }
        return false;
    }

    async createCleaningJob(validated) {
        try {            
            const newJob = {
                userID: validated.userID,
                startTime: validated.startTime,
                serviceType: validated.serviceType,
                price: validated.price,
                listDays: validated.listDays,
                createdAt: new Date(),
                status: validated.status,
                location: validated.location,
                durationID: validated.duration.uid,
                isCooking: validated.isCooking,
                isIroning: validated.isIroning,
            }
            const jobRef = await db.collection('cleaningJobs').add(newJob);
            validated['uid'] = jobRef.id;
            validated['createdAt'] = formatDate(newJob.createdAt);
            
            return validated;
        } catch (err) {
            console.log(err.message);
            throw new Error("Tạo job không thành công")
        }
    }

    async createHealthcareJob(validated) {
        try {
            const healthcareDetailIDs = [];

            for (const service of validated.services) {
                const detailRef = await db.collection('healthcareDetails').add({
                    serviceID: service.serviceID,
                    quantity: service.quantity,
                })
                healthcareDetailIDs.push(detailRef.id)
            }

            const newJob = {
                userID: validated.userID,
                startTime: validated.startTime,
                serviceType: validated.serviceType,
                price: validated.price,
                workerQuantity: validated.workerQuantity,
                listDays: validated.listDays,
                createdAt: new Date(), 
                status: validated.status,
                location: validated.location,
                shiftID: validated.shift.uid,
                services: healthcareDetailIDs
            }

            const jobRef = await db.collection('healthcareJobs').add(newJob);
            validated['uid'] = jobRef.id;
            validated['createdAt'] = formatDate(newJob.createdAt);
            
            return validated;
        } catch (err) {
            console.log(err.message);
            throw new Error("Tạo job không thành công")
        }
    }

    async createMaintenanceJob(validated) {
        try {
            const serviceIDs = [];
            for (const service of validated.services) {
                const powerIDs = [];
                for (const power of service.powers) {
                    const powerRef = await db.collection('machineQuantities').add(power);
                    powerIDs.push(powerRef.id);
                }
                const doc = { ...service, powers: powerIDs }
                const serviceRef = await db.collection('maintenanceJobDetails').add(doc);
                serviceIDs.push(serviceRef.id);
            }

            const newJob = {
                userID: validated.userID,
                startTime: validated.startTime,
                serviceType: validated.serviceType,
                price: validated.price,
                listDays: validated.listDays,
                createdAt: new Date(), 
                status: validated.status,
                location: validated.location,
                services: serviceIDs
            }

            const jobRef = await db.collection('maintenanceJobs').add(newJob);
            validated['uid'] = jobRef.id;
            validated['createdAt'] = formatDate(newJob.createdAt);

            return validated;            
        } catch (err) {
            console.log(err.message);
            throw new Error("Tạo job không thành công")
        }
    }

    async putStatusByUID(uid, serviceType, status) {
        const db_name = `${serviceType.toLowerCase()}Jobs`;
        await db.collection(db_name).doc(uid).update({
            status: status
        })
    }

    async getPrice(uid, serviceType) {
        try {
            const db_name = `${serviceType.toLowerCase()}Jobs`;
            const jobDoc = await db.collection(db_name).doc(uid).get();

            if (!jobDoc.exists) throw new Error("Lỗi không lấy được mức lương");

            const price = jobDoc.data().price * 0.9;

            return serviceType==='HEALTHCARE' ? price/jobDoc.data().workerQuantity : price;
        } catch (err) {
            console.log(err.message);
            throw new Error("Không lấy được mức lương")
        }
    }

    async getByUID(uid, serviceType) {
        try {
            const db_name = `${serviceType.toLowerCase()}Jobs`;
            const jobDoc = await db.collection(db_name).doc(uid).get();

            return await this.getJob(uid, jobDoc.data());
        } catch (err) {
            console.log(err.message);
            throw new Error("Không thành công")
        }
    }

    async getJobNew() {
        try {
            const now = new Date();
            const dayPre10 = new Date(now.getTime() - 20 * 24 * 60 * 60 *1000);

            const [snapshotCleaning, snapshotHealthcare, snapshotMaintenance] = await Promise.all([
                db.collection('cleaningJobs').where('createdAt', '>=', dayPre10).get(),
                db.collection('healthcareJobs').where('createdAt', '>=', dayPre10).get(),
                db.collection('maintenanceJobs').where('createdAt', '>=', dayPre10).get(),
            ]);

            const res = [
                ...snapshotCleaning.docs.map(doc => ({ uid: doc.id, ...doc.data() })).filter(job => job.status == 'Hiring'),
                ...snapshotHealthcare.docs.map(doc => ({ uid: doc.id, ...doc.data() })).filter(job => job.status == 'Hiring'),
                ...snapshotMaintenance.docs.map(doc => ({ uid: doc.id, ...doc.data() })).filter(job => job.status == 'Hiring'),
            ];

            res.sort((a, b) => b.createdAt.toDate() - a.createdAt.toDate());

            const jobs = await Promise.all(res.map(job => this.getJob(job.uid, job)));

            return jobs;
        } catch (err) {
            console.log(err.message);
            throw new Error("Không thành công");
        }
    }

    async getJobsByUserID(userID) {
        try {

            const [snapshotCleaning, snapshotHealthcare, snapshotMaintenance] = await Promise.all([
                await db.collection('cleaningJobs').where('userID', '==', userID).get(),
                await db.collection('healthcareJobs').where('userID', '==', userID).get(),
                await db.collection('maintenanceJobs').where('userID', '==', userID).get()
            ]);

            const allJobs = [
                ...snapshotCleaning.docs.map((doc) => ({ uid: doc.id, data: doc.data() })),
                ...snapshotHealthcare.docs.map((doc) => ({ uid: doc.id, data: doc.data() })),
                ...snapshotMaintenance.docs.map((doc) => ({ uid: doc.id, data: doc.data() }))
            ];

            const jobs = [];
            await Promise.all(allJobs.map(async (job) => {
                jobs.push(await this.getJob(job.uid, job.data));
            }));

            return jobs;
        } catch (err) {
            console.log(err.message);
            throw new Error("Không tìm thấy")
        }
    }

    async getJobsByServiceType(serviceType) {
        try {
            const db_name = `${serviceType.toLowerCase()}Jobs`;
            const snapshot = await db.collection(db_name).get();

            const jobs = [];

            await Promise.all(snapshot.docs.map(async (doc) => {
                jobs.push(await this.getJob(doc.id, doc.data()));
            }));

            return jobs;
        } catch (err) {
            console.log(err.message);
            throw new Error("Lỗi lấy thông tin job")
        }
    }

    async getJob(uid, data) {
        const userDoc = await UserService.getByUID(data.userID);

        delete data['userID'];
        data['uid'] = uid;
        data['user'] = userDoc;
        data['createdAt'] = formatDate(data.createdAt.toDate());

        if (data.serviceType==='CLEANING') {
            const duration = await TimeService.getDurationByID(data.durationID);
            data['duration'] = duration;
            const validated = await CleaningJobGetvalid.validateAsync(data, { stripUnknown: true });
            return validated;
        }
        else if (data.serviceType==='HEALTHCARE') {
            const shift = await TimeService.getShiftByID(data.shiftID);
            const healthcareDetails = data.services;

            const services = [];
            for (const healthcareDetailID of healthcareDetails) {
                const serviceQuantityDoc = await db.collection('healthcareDetails').doc(healthcareDetailID).get();
                services.push({
                    serviceID: serviceQuantityDoc.data().serviceID,
                    quantity: serviceQuantityDoc.data().quantity
                })
            } 
            data['shift'] = shift;
            data['services'] = services;
            const validated = await HealthcareJobGetValid.validateAsync(data, { stripUnknown: true });
            return validated;
        }
        else if (data.serviceType==='MAINTENANCE') {
            const services = [];
            for (const serviceID of data.services) {
                const details = await db.collection('maintenanceJobDetails').doc(serviceID).get();
                if (!details.exists) continue;

                const serviceDetails = details.data();
                const powerDetails = [];
                for (const powerID of serviceDetails.powers) {
                    const power = await db.collection('machineQuantities').doc(powerID).get();
                    if (!power.exists) continue;
                    powerDetails.push(power.data());
                }

                serviceDetails['powers'] = powerDetails;
                services.push(serviceDetails)
            }

            data['services'] = services;
            const validated = await MaintenanceJobGetValid.validateAsync(data, { stripUnknown: true });
            return validated;
        }
    }
}

module.exports = new JobService();