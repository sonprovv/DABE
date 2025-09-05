const { db } = require("../config/firebase");
const { formatDate, formatDateAndTime } = require("../utils/formatDate");
const { CleaningJobGetvalid, HealthcareJobGetValid } = require("../utils/validator/JobValid");
const AccountService = require("./AccountService");
const ServiceService = require("./ServiceService");
const TimeService = require("./TimeService");
const UserService = require("./UserService");

class JobService {
    constructor() {}

    async createCleaningJob(newJob) {
        try {
            const docRef = await db.collection('cleaningJobs').add(newJob);

            return docRef.id;
        } catch (err) {
            console.log(err.message);
            throw new Error("Tạo job không thành công")
        }
    }

    async createHealthcareJob(newJob) {
        try {
            const docRef = await db.collection('healthcareJobs').add(newJob);

            return docRef.id;
        } catch (err) {
            console.log(err.message);
            throw new Error("Tạo job không thành công")
        }
    }

    async createHealthcareDetails(lst) {
        try {
            const uids = [];

            for (const element of lst) {
                const docRef = await db.collection('healthcareDetails').add(element);
                uids.push(docRef.id);
            }

            return uids;
        } catch (err) {
            console.log(err.message);
            throw new Error("Tạo job không thành công")
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
            throw new Error("Danh mục không tồn tại")
        } catch (err) {
            console.log(err.message);
            throw new Error("Không thành công")
        }
    }

    async getJobsByUserID(userID) {
        try {
            const snapshotCleaning = await db.collection('cleaningJobs').where('userID', '==', userID).get();
            const snapshotHeaalthcare = await db.collection('healthcareJobs').where('userID', '==', userID).get();
            const jobs = [];

            for (const doc of snapshotCleaning.docs) {
                jobs.push(await this.getJob(doc.id, doc.data()));
            }

            for (const doc of snapshotHeaalthcare.docs) {
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
                if (!detailDoc.exists) {
                    continue;
                }
                details.push(detailDoc.data());
            }

            return details;
        } catch (err) {
            console.log(err.message);
            throw new Error("Không thành công")
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
        user['dob'] = formatDate(user.dob.toDate());
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

        throw new Error('Lôĩ');
    }
}

module.exports = new JobService();