const { db } = require("../config/firebase");
const TimeService = require("../services/TimeService");

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

const findWorkerAndNotify = async (userSockets, job, notify) => {
    const snapshotOrder = await db.collection("orders").where('jobID', '==', job.id).get();

    await Promise.all(snapshotOrder.docs.map(async (doc) => {
        const socket = userSockets.get(doc.data().workerID);

        console.log(doc.data().workerID);

        if (socket) {
            socket.emit('jobNotification', notify);
            await db.collection('notifications').add({
                ...notify,
                workerID: doc.data().workerID,
                createdAt: new Date()
            })
        } 
    }))
}

const jobSchedule = (serviceType, collectionName, intervalRef, userSockets) => {
    if (intervalRef.value) return;

    intervalRef.value = setInterval(async () => {
        
        const { date, time, time30 } = getTimeNotication();

        const snapshot = await db.collection(collectionName).get();

        for (const job of snapshot.docs) {

            let endTime;
            try {
                if (serviceType==='CLEANING') {
                    endTime = await getEndTime(job.data().startTime, job.data().durationID, job.data().serviceType);
                }
                else if (serviceType==='HEALTHCARE') {
                    endTime = await getEndTime(job.data().startTime, job.data().shiftID, job.data().serviceType);
                }
            } catch (errr) {
                continue;
            }

            const notify = {
                jobID: job.id,
                title: 'Thông báo công việc',
                content: '',
                time: null,
                serviceType: serviceType
            }

            if (job.data().startTime===time30) {
                let check = false;
                for (const day of job.data().listDays) {
                    if (day===date) {
                        check = true;
                        break;
                    }
                }

                if (check) {
                    notify['content'] = 'Công việc sẽ bắt đầu sau 30 phút.\n Vui lòng sắp xếp di chuyển để thực hiện công việc.';
                    notify['time'] = job.data().startTime;
                    await findWorkerAndNotify(userSockets, job, notify);
                }
            }
            else if (job.data().startTime===time) {
                for (const day of job.data().listDays) {
                    if (day===date) {
                        check = true;
                        break;
                    }
                }

                if (check) {
                    notify['content'] = 'Công việc đã bắt đầu.';
                    notify['time'] = job.data().startTime;
                    await findWorkerAndNotify(userSockets, job, notify);
                }
            }
            else if (endTime===time) {
                let check = false;
                for (const day of job.data().listDays) {
                    if (day===date) {
                        check = true;
                        break;
                    }
                }

                if (check) {
                    notify['content'] = 'Công việc đã kết thúc';
                    notify['time'] = endTime;
                    await findWorkerAndNotify(userSockets, job, notify);
                }
            }
        }
    }, 60000);
}

const cleaningJobSchedule = (io, userSockets) => jobSchedule('CLEANING', 'cleaningJobs', { value: cleaningJobInterval }, userSockets);
const healthcareJobSchedule = (io, userSockets) => jobSchedule('HEALTHCARE', 'healthcareJobs', { value: healthcareJobInterval }, userSockets);

module.exports = { cleaningJobSchedule, healthcareJobSchedule };