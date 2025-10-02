const { updateMetadataStatus } = require("../ai/Embedding");
const { db } = require("../config/firebase");
const JobService = require("../services/JobService");
const OrderService = require("../services/OrderService");
const TimeService = require("../services/TimeService");
const { findDevices } = require("./tool");

let cleaningJobInterval = null, healthcareJobInterval = null;

const pad = (n) => n.toString().padStart(2, '0');

const getTimeNotication = () => {
    const now = new Date();

    const day = pad(now.getDate());
    const month = pad((now.getMonth() + 1));
    const year = now.getFullYear();
    const hour = now.getHours();
    const minute = now.getMinutes();

    let hour30 = hour, minute30 = minute;

    if (minute30<30) {
        hour30 = (hour30 - 1 + 24) % 24;
        minute30 += 30;
    }
    else minute30 -= 30;

    return {
        date: `${day}/${month}/${year}`,
        time: `${pad(hour)}:${pad(minute)}`,
        time30: `${pad(hour30)}:${pad(minute30)}`
    }
}

const getEndTime = async (startTime, uid, serviceType) => {

    let hour = parseInt(startTime.split(':')[0]);
    const minute = startTime.split(':')[1];
    if (serviceType==='CLEANING') {
        const { workingHour } = await TimeService.getDurationByID(uid);
        hour = (hour + workingHour) % 24;
    }
    else if (serviceType==='HEALTHCARE') {
        const { workingHour } = await TimeService.getShiftByID(uid);
        hour = (hour + workingHour) % 24;
    }

    return `${pad(hour)}:${minute}`;
}

const findWorkerAndNotify = async (job, notify) => {
    const snapshotOrder = await db.collection("orders").where('jobID', '==', job.uid).get();
    if (snapshotOrder.empty) return;

    const docs = snapshotOrder.docs.filter(d => d.data().status != 'Rejected');
    if (docs.length==0) return;

    await Promise.allSettled(docs.map(async (doc) => {
        const order = { uid: doc.id, ...doc.data() };
        if (doc.data().status!=job.status) {
            await OrderService.putStatusByUID(order.id, job.status);
        }

        await db.collection('notifications').add({
            ...notify,
            clientID: order.workerID
        });

        await findDevices(order.workerID, notify);
    }))
}

const findUserOfJob = async (userID, notify) => {
    await db.collection('notifications').add({
        ...notify,
        clientID: userID
    });
    
    await findDevices(userID, notify);
}

const createNotification = (jobID, content, time, serviceType) => {
    return {
        jobID: jobID,
        title: 'Thông báo công việc',
        content: content,
        time: time,
        isRead: false,
        serviceType: serviceType,
        createdAt: new Date(),
        notificationType: 'Job'
    };
}

const jobSchedule = (serviceType, collectionName, intervalRef) => {
    if (intervalRef.value) return;

    intervalRef.value = setInterval(async () => {
        
        const { date, time, time30 } = getTimeNotication();

        const snapshot = await db.collection(collectionName).where('status', 'not-in', ['Completed']).get();

        await Promise.all(snapshot.docs.map(async (doc) => {
            const job = { uid: doc.id, ...doc.data() }

            let endTime;
            try {
                if (serviceType==='CLEANING') {
                    endTime = await getEndTime(job.startTime, job.durationID, job.serviceType);
                }
                else if (serviceType==='HEALTHCARE') {
                    endTime = await getEndTime(job.startTime, job.shiftID, job.serviceType);
                }
            } catch (errr) {
                return;
            }

            const isToday = job.listDays.includes(date);
            if (!isToday) return;

            if (job.startTime===time30) {
                const content = 'Công việc sẽ bắt đầu sau 30 phút.\n Vui lòng sắp xếp di chuyển để thực hiện công việc.';
                const notify = createNotification(job.uid, content, job.startTime, serviceType);
                await Promise.all([
                    findWorkerAndNotify(job, notify),
                    findUserOfJob(job.userID, notify)
                ])
            }
            else if (job.startTime===time) {
                if (job.status!=='Processing') {
                    await JobService.putStatusByUID(job.uid, job.serviceType, 'Processing');
                    await updateMetadataStatus(job.uid, 'Processing');
                    job['status'] = 'Processing';
                }
                const content = 'Công việc đã bắt đầu.';
                const notify = createNotification(job.uid, content, job.startTime, serviceType);
                await Promise.all([
                    findWorkerAndNotify(job, notify),
                    findUserOfJob(job.userID, notify)
                ])
            }
            else if (endTime===time) {
                if (job.listDays.indexOf(date)===job.listDays.length-1) {
                    await JobService.putStatusByUID(job.uid, job.serviceType, 'Completed');
                    await updateMetadataStatus(job.uid, 'Completed');
                    job['status'] = 'Completed'
                }
                const content = 'Công việc đã kết thúc';
                const notify = createNotification(job.uid, content, endTime, serviceType);
                await Promise.all([
                    findWorkerAndNotify(job, notify),
                    findUserOfJob(job.userID, notify)
                ])
            }
        }))
    }, 60000);
}

const cleaningJobSchedule = () => jobSchedule('CLEANING', 'cleaningJobs', { value: cleaningJobInterval });
const healthcareJobSchedule = () => jobSchedule('HEALTHCARE', 'healthcareJobs', { value: healthcareJobInterval });

module.exports = { cleaningJobSchedule, healthcareJobSchedule };