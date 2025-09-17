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

const deleteFcmToken = async (response, clientID, devices) => {
    const tokens = [];
    for (let i = 0; i < response.responses.length; i++) {
        const res = response.responses[i];
        const validToken = devices[i];

        if (res.success) {
            tokens.push(validToken);
        }
    }
    await db.collection('devices').doc(clientID).update({
        devices: tokens
    })
}

const findWorkerAndNotify = async (job, notify) => {
    const snapshotOrder = await db.collection("orders").where('jobID', '==', job.uid).get();
    if (snapshotOrder.empty) return;

    const docs = snapshotOrder.docs.filter(d => d.data().status != 'Rejected');
    if (docs.length==0) return;

    await Promise.allSettled(docs.map(async (doc) => {

        if (doc.data().status!=job.status) {
            const updatedOrder = await OrderService.putStatusByUID(doc.id, job.status);
        }

        const workerID = doc.data().workerID;
        
        await db.collection('notifications').add({
            ...notify,
            clientID: workerID
        });

        const deviceDoc = await db.collection('devices').doc(workerID).get();
        if (!deviceDoc.exists) return;

        const devices = deviceDoc.data().devices;
        if (!devices || devices.length===0) return;

        const message = {
            tokens: devices,
            notification: {
                title: notify.title,
                body: notify.content
            },
            data: notify
        }        
        const response = await admin.messaging().sendEachForMulticast(message);

        if (response.failureCount!==0) {
            deleteFcmToken(response, workerID, devices);
        }
    }))
}

const findUserOfJob = async (userID, notify) => {
    await db.collection('notifications').add({
        ...notify,
        clientID: userID
    });
    
    const deviceDoc = await db.collection('devices').doc(userID).get();
    if (!deviceDoc.exists) return;

    const devices = deviceDoc.data().devices;
    if (!devices || devices.length===0) return; 

    const message = {
        tokens: devices,
        notification: {
            title: notify.title,
            body: notify.content
        },
        data: notify
    }
    const response = await admin.messaging().sendEachForMulticast(message);
    // console.log("FCM Response:", response);
    // await admin.messaging().send(message); with token: device
    if (response.failureCount!==0) {
        deleteFcmToken(response, userID, devices);
    }
}

const jobSchedule = (serviceType, collectionName, intervalRef) => {
    if (intervalRef.value) return;

    intervalRef.value = setInterval(async () => {
        
        const { date, time, time30 } = getTimeNotication();

        const snapshot = await db.collection(collectionName).where('status', 'not-in', ['Completed']).get();

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
                isRead: false,
                serviceType: serviceType,
                createdAt: new Date()
            }

            console.log('in')
            if (job.startTime===time30) {
                if (job.listDays.includes(date)) {
                    notify['content'] = 'Công việc sẽ bắt đầu sau 30 phút.\n Vui lòng sắp xếp di chuyển để thực hiện công việc.';
                    notify['time'] = job.startTime;
                    await Promise.all([
                        findWorkerAndNotify(job, notify),
                        findUserOfJob(job.userID, notify)
                    ])
                }
            }
            else if (job.startTime===time) {
                if (job.listDays.includes(date)) {
                    if (job.status!=='Processing') {
                        await JobService.putStatusByUID(job.uid, job.serviceType, 'Processing');
                        job['status'] = 'Processing';
                    }
                    notify['content'] = 'Công việc đã bắt đầu.';
                    notify['time'] = job.startTime;
                    await Promise.all([
                        findWorkerAndNotify(job, notify),
                        findUserOfJob(job.userID, notify)
                    ])
                }
            }
            else if (endTime===time) {
                if (job.listDays.includes(date)) {
                    const index = job.listDays.indexOf(date);
                    if (index===job.listDays.length-1) {
                        await JobService.putStatusByUID(job.uid, job.serviceType, 'Completed');
                        job['status'] = 'Completed'
                    }
                    notify['content'] = 'Công việc đã kết thúc';
                    notify['time'] = endTime;
                    await Promise.all([
                        findWorkerAndNotify(job, notify),
                        findUserOfJob(job.userID, notify)
                    ])
                }
            }
        }
    }, 60000);
}

const cleaningJobSchedule = () => jobSchedule('CLEANING', 'cleaningJobs', { value: cleaningJobInterval });
const healthcareJobSchedule = () => jobSchedule('HEALTHCARE', 'healthcareJobs', { value: healthcareJobInterval });

module.exports = { cleaningJobSchedule, healthcareJobSchedule };