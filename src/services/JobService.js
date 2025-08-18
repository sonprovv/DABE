const { db } = require("../config/firebase");
const { formatDate } = require("../utils/formatDate");
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

    async getCleaningJobs() {
        try {
            const snapshot = await db.collection('cleaningJobs').get();

            const jobs = [];
            for (const doc of snapshot.docs) {
                const tmp = {
                    uid: doc.id,
                    serviceType: doc.data().serviceType,
                    startTime: doc.data().startTime,
                    workerQuantity: doc.data().workerQuantity,
                    status: doc.data().status,
                    price: doc.data().price,
                    isWeek: doc.data().isWeek,
                    dayOfWeek: doc.data().dayOfWeek,
                    createdAt: formatDate(doc.data().createdAt.toDate()),
                    isCooking: doc.data().isCooking,
                    isIroning: doc.data().isIroning,
                }
                const account = await AccountService.getByUID(doc.data().userID);
                const user = await UserService.getByUID(doc.data().userID);
                const duration = await TimeService.getDurationByID(doc.data().durationID);
                const services = [];
                for (const serviceID of doc.data().services) {
                    const serviceDoc = await ServiceService.getCleaningServiceByUID(serviceID);
                    services.push(serviceDoc);
                }
                user['email'] = account.email;
                user['role'] = account.role;
                user['dob'] = formatDate(user.dob.toDate());
                tmp['user'] = user;
                tmp['duration'] = duration;
                tmp['services'] = services;
                const validated = await CleaningJobGetvalid.validateAsync(tmp, { stripUnknown: true });
                jobs.push(validated);
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
                const tmp = {
                    uid: doc.id,
                    serviceType: doc.data().serviceType,
                    startTime: doc.data().startTime,
                    workerQuantity: doc.data().workerQuantity,
                    status: doc.data().status,
                    price: doc.data().price,
                    isWeek: doc.data().isWeek,
                    dayOfWeek: doc.data().dayOfWeek,
                    createdAt: formatDate(doc.data().createdAt.toDate()),
                }
                const account = await AccountService.getByUID(doc.data().userID);
                const user = await UserService.getByUID(doc.data().userID);
                const shift = await TimeService.getShiftByID(doc.data().shiftID);
                const serviceIDs = doc.data().services;

                const details = await this.getHealthcareDetails(serviceIDs);

                const services = [];
                for (const service of details) {
                    const serviceDoc = await ServiceService.getHealthcareServiceByUID(service.healthcareServiceID);
                    services.push({
                        healthcareService: serviceDoc,
                        quantity: service.quantity
                    })
                }
                console.log(services)
                user['email'] = account.email;
                user['role'] = account.role;
                user['dob'] = formatDate(user.dob.toDate());
                tmp['user'] = user;
                tmp['shift'] = shift;
                tmp['services'] = services;
                // console.log(tmp)
                const validated = await HealthcareJobGetValid.validateAsync(tmp, { stripUnknown: true });
                jobs.push(validated);
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
}

module.exports = new JobService();