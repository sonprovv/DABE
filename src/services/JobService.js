const { db } = require("../config/firebase");
const { formatDate, formatDateAndTime } = require("../utils/formatDate");
const { CleaningJobGetvalid, HealthcareJobGetValid, MaintenanceJobGetValid } = require("../utils/validator/JobValid");
const AccountService = require("./AccountService");
const ServiceService = require("./ServiceService");
const TimeService = require("./TimeService");
const UserService = require("./UserService");

class JobService {
    constructor() {}

    async createCleaningJob(validated) {
        try {
            const serviceIDs = [];
            for (const service of validated.services) {
                serviceIDs.push(service.uid)
            }
            
            const newJob = {
                userID: validated.user.uid,
                startTime: validated.startTime,
                serviceType: validated.serviceType,
                workerQuantity: validated.workerQuantity,
                price: validated.price,
                isWeek: validated.isWeek,
                listDays: validated.listDays,
                createdAt: new Date(),
                status: validated.status,
                location: validated.location,
                durationID: validated.duration.uid,
                services: serviceIDs,
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

            for (const healthcareDetails of validated.services) {
                const detailRef = await db.collection('healthcareDetails').add({
                    healthcareServiceID: healthcareDetails.healthcareService.uid,
                    quantity: healthcareDetails.quantity,
                })
                healthcareDetailIDs.push(detailRef.id)
            }

            const newJob = {
                userID: validated.user.uid,
                startTime: validated.startTime,
                serviceType: validated.serviceType,
                workerQuantity: validated.workerQuantity,
                price: validated.price,
                isWeek: validated.isWeek,
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
                service['powers'] = powerIDs;
                const serviceRef = await db.collection('maintenanceJobDetails').add(service);
                serviceIDs.push(serviceRef.id);
            }

            const newJob = {
                userID: validated.user.uid,
                startTime: validated.startTime,
                serviceType: validated.serviceType,
                workerQuantity: validated.workerQuantity,
                price: validated.price,
                isWeek: validated.isWeek,
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

    async getJobNew() {
        try {
            const now = new Date();
            const dayPre10 = new Date(now.getTime() - 20 * 24 * 60 * 60 *1000);

            const snapshotCleaning = await db.collection('cleaningJobs').where('createdAt', '>=', dayPre10).get();
            const snapshotHealthcare = await db.collection('healthcareJobs').where('createdAt', '>=', dayPre10).get();
            const snapshotMaintenance = await db.collection('maintenanceJobs').where('createdAt', '>=', dayPre10).get();

            const res = [];
            for (const doc of snapshotCleaning.docs) res.push({ uid: doc.id, ...doc.data() });
            for (const doc of snapshotHealthcare.docs) res.push({ uid: doc.id, ...doc.data() });
            for (const doc of snapshotMaintenance.docs) res.push({ uid: doc.id, ...doc.data() });

            for (let i = 0; i < res.length; i++) {
                for (let j = i+1; j < res.length; j++) {
                    if (res[i].createdAt<res[j].createdAt) {
                        const tmp = res[i];
                        res[i] = res[j];
                        res[j] = tmp;
                    }
                }
            }

            for (let i = 0; i < res.length; i++) {
                const job = await this.getJob(res[i].uid, res[i]);
                res[i] = job;
            }

            return res;
        } catch (err) {
            console.log(err.message);
            throw new Error("Không thành công")
        }
    }

    async getByUID(uid, serviceType) {
        try {
            if (serviceType.toUpperCase()==='CLEANING') {
                const jobDoc = await db.collection('cleaningJobs').doc(uid).get();

                return await this.getJob(uid, jobDoc.data());
            }
            else if (serviceType.toUpperCase()==='HEALTHCARE') {
                const jobDoc = await db.collection('healthcareJobs').doc(uid).get();

                return await this.getJob(uid, jobDoc.data());
            }
            else if (serviceType.toUpperCase()==='MAINTENANCE') {
                const jobDoc = await db.collection('maintenanceJobs').doc(uid).get();

                return await this.getJob(uid, jobDoc.data());
            }
            throw new Error("Danh mục không tồn tại")
        } catch (err) {
            console.log(err.message);
            throw new Error("Không thành công")
        }
    }

    async getJobsByUserID(userID) {
        try {
            const snapshotCleaning = await db.collection('cleaningJobs').where('userID', '==', userID).get();
            const snapshotHealthcare = await db.collection('healthcareJobs').where('userID', '==', userID).get();
            const snapshotMaintenance = await db.collection('maintenanceJobs').where('userID', '==', userID).get();
            const jobs = [];

            for (const doc of snapshotCleaning.docs) {
                jobs.push(await this.getJob(doc.id, doc.data()));
            }

            for (const doc of snapshotHealthcare.docs) {
                jobs.push(await this.getJob(doc.id, doc.data()));
            }

            for (const doc of snapshotMaintenance.docs) {
                jobs.push(await this.getJob(doc.id, doc.data()));
            }

            return jobs;
        } catch (err) {
            console.log(err.message);
            throw new Error("Không tìm thấy")
        }
    }

    async getCleaningJobs() {
        try {
            const snapshot = await db.collection('cleaningJobs').get();

            const jobs = [];
            for (const doc of snapshot.docs) {
                jobs.push(await this.getJob(doc.id, doc.data()));
            }

            return jobs;
        } catch (err) {
            console.log(err.message);
            throw new Error("Lỗi lấy thông tin job")
        }
    }

    async getHealthcareJobs() {
        try {
            const snapshot = await db.collection('healthcareJobs').get();

            const jobs = [];
            for (const doc of snapshot.docs) {
                jobs.push(await this.getJob(doc.id, doc.data()));
            }

            return jobs;
        } catch (err) {
            console.log(err.message);
            throw new Error("Lỗi lấy thông tin job")
        }
    }

    async getHealthcareDetails(lst) {
        try {
            const details = [];

            for (const serviceID of lst) {
                const detailDoc = await db.collection('healthcareDetails').doc(serviceID).get();
                if (!detailDoc.exists) continue;
                details.push(detailDoc.data());
            }

            return details;
        } catch (err) {
            console.log(err.message);
            throw new Error("Không thành công")
        }
    }

    async getMaintenanceJobs() {
        try {
            const snapshot = await db.collection('maintenanceJobs').get();

            const jobs = [];
            for (const doc of snapshot.docs) {
                jobs.push(await this.getJob(doc.id, doc.data()));
            }

            return jobs;
        } catch (err) {
            console.log(err.message);
            throw new Error("Lỗi lấy thông tin job")
        }
    }

    async getJob(uid, data) {
        const accountDoc = await AccountService.getByUID(data.userID);
        const userDoc = await UserService.getByUID(data.userID);

        const user = {
            uid: data.userID,
            ...userDoc,
            email: accountDoc.email,
            role: accountDoc.role
        };
        user['dob'] = formatDate(typeof user.dob.toDate === 'function' ? user.dob.toDate() : user.dob);
        delete data['userID'];
        data['uid'] = uid;
        data['user'] = user;
        data['createdAt'] = formatDate(data.createdAt.toDate());

        if (data.serviceType==='CLEANING') {
            const duration = await TimeService.getDurationByID(data.durationID);
            const services = [];
            for (const serviceID of data.services) {
                const serviceDoc = await ServiceService.getCleaningServiceByUID(serviceID);
                services.push(serviceDoc);
            }
            data['duration'] = duration;
            data['services'] = services;
            const validated = await CleaningJobGetvalid.validateAsync(data, { stripUnknown: true });
            return validated;
        }
        else if (data.serviceType==='HEALTHCARE') {
            const shift = await TimeService.getShiftByID(data.shiftID);
            const serviceIDs = data.services;

            const details = await this.getHealthcareDetails(serviceIDs);

            const services = [];
            for (const service of details) {
                const serviceDoc = await ServiceService.getHealthcareServiceByUID(service.healthcareServiceID);
                services.push({
                    healthcareService: serviceDoc,
                    quantity: service.quantity
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
            console.log(data)
            const validated = await MaintenanceJobGetValid.validateAsync(data, { stripUnknown: true });
            return validated;
        }
    }
}

module.exports = new JobService();