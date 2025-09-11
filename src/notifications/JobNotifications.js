const { db, admin } = require("../config/firebase");
const JobService = require("../services/JobService");
const OrderService = require("../services/OrderService");
const TimeService = require("../services/TimeService");
const { formatDateAndTimeNow } = require("../utils/formatDate");

let cleaningJobInterval = null, healthcareJobInterval = null;

const getTimeNotication = () => {
    const now = new Date();

    const day = now.getDate().toString().padStart(2, '0');
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const year = now.getFullYear();

    const hour = now.getHours();
    const minute = now.getMinutes();

    let hour30 = hour, minute30 = minute;

    if (minute30<30) {
        hour30 = (hour30 - 1 + 24) % 24;
        minute30 += 30;
    }
    else {
        minute30 -= 30;
    }

    const date = `${day}/${month}/${year}`;
    const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    const time30 = `${hour30.toString().padStart(2, '0')}:${minute30.toString().padStart(2, '0')}`;

    return {
        date: date,
        time: time,
        time30: time30
    }
}

const getEndTime = async (startTime, uid, serviceType) => {

    let hour = parseInt(startTime.split(':')[0]);
    const minute = startTime.split(':')[1];
    if (serviceType==='CLEANING') {
        const response = await TimeService.getDurationByID(uid);
        hour = (hour + response.workingHour) % 24;
    }
    else if (serviceType==='HEALTHCARE') {
        const response = await TimeService.getShiftByID(uid);
        hour = (hour + response.workingHour) % 24;
    }

    return `${hour.toString().padStart(2, '0')}:${minute}`;
}

const findWorkerAndNotify = async (job, notify) => {
    const snapshotOrder = await db.collection("orders").where('jobID', '==', job.uid).get();

    await Promise.allSettled(snapshotOrder.docs.map(async (doc) => {

        if (doc.data().status!=job.status) {
            const updatedOrder = await OrderService.putStatusByUID(doc.id, job.status);
        }

        const workerID = doc.data().workerID;

        const deviceDoc = await db.collection('devices').doc(workerID).get();
        if (!deviceDoc.exists) return;

        const devices = deviceDoc.data().devices;
        if (!devices || devices.length===0) return;

        notify['clientID'] = workerID;
        await admin.messaging().sendToDevice(devices, {
            notification: {
                title: notify.title,
                body: notify.content
            },
            data: notify
        })

        await db.collection('notifications').add(notify);
    }))
}

const jobSchedule = (serviceType, collectionName, intervalRef) => {
    if (intervalRef.value) return;

    intervalRef.value = setInterval(async () => {
        
        const { date, time, time30 } = getTimeNotication();

        const snapshot = await db.collection(collectionName).where('status', '!=', 'Completed').get();

        for (const doc of snapshot.docs) {
            const job = {
                uid: doc.id,
                ...doc.data()
            }

            let endTime;
            try {
                if (serviceType==='CLEANING') {
                    endTime = await getEndTime(job.startTime, job.durationID, job.serviceType);
                }
                else if (serviceType==='HEALTHCARE') {
                    endTime = await getEndTime(job.startTime, job.shiftID, job.serviceType);
                }
            } catch (errr) {
                continue;
            }

            const notify = {
                jobID: job.uid,
                title: 'Thông báo công việc',
                content: '',
                time: null,
                serviceType: serviceType,
                createdAt: formatDateAndTimeNow()
            }

            if (job.startTime===time30) {
                let check = false;
                for (const day of job.listDays) {
                    if (day===date) {
                        check = true;
                        break;
                    }
                }

                if (check) {
                    notify['content'] = 'Công việc sẽ bắt đầu sau 30 phút.\n Vui lòng sắp xếp di chuyển để thực hiện công việc.';
                    notify['time'] = job.startTime;
                    await findWorkerAndNotify(job, notify);
                }
            }
            else if (job.startTime===time) {
                for (const day of job.listDays) {
                    if (day===date) {
                        check = true;
                        break;
                    }
                }

                if (check) {
                    if (job.status!=='Processing') {
                        await JobService.putStatusByUID(job.uid, job.serviceType, 'Processing');
                        job['status'] = 'Processing';
                    }
                    notify['content'] = 'Công việc đã bắt đầu.';
                    notify['time'] = job.startTime;
                    await findWorkerAndNotify(job, notify);
                }
            }
            else if (endTime===time) {
                let check = false;
                let completed = false;
                const listDays = job.listDays;

                for (let i = 0; i < listDays.length; i++) {
                    if (listDays[i]===date) {
                        check = true;
                        if (i===listDays.length-1) completed = true;
                        break;
                    }
                }

                if (completed) {
                    await JobService.putStatusByUID(job.uid, job.serviceType, 'Completed');
                    job['status'] = 'Completed'
                }

                if (check) {
                    notify['content'] = 'Công việc đã kết thúc';
                    notify['time'] = endTime;
                    await findWorkerAndNotify(job, notify);
                }
            }
        }
    }, 60000);
}

const cleaningJobSchedule = () => jobSchedule('CLEANING', 'cleaningJobs', { value: cleaningJobInterval });
const healthcareJobSchedule = () => jobSchedule('HEALTHCARE', 'healthcareJobs', { value: healthcareJobInterval });

module.exports = { cleaningJobSchedule, healthcareJobSchedule };