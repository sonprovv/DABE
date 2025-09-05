const { db } = require("../config/firebase");
const TimeService = require("../services/TimeService");

let cleaningJobInterval = null, healthcareJobInterval = null;

const format30M = () => {
    const now = new Date();
    return new Date(now.getTime() + 30 * 60000);
};

const getTimeNotication = () => {
    const now = new Date();

    const day = now.getDate().toString().padStart(2, '0');
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const year = now.getFullYear();

    const hour = now.getHours();
    const minute = now.getMinutes();

    let hour30 = hour, minute30 = minute;

    if (minute30<30) {
        hour30 -= 1;
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
        hour += response.workingHour;
    }
    else if (serviceType==='HEALTHCARE') {
        const response = await TimeService.getShiftByID(uid);
        hour += response.workingHour;
    }

    return `${hour.toString().padStart(2, '0')}:${minute}`;
}

const findWorkerAndNotify = async (userSockets, job, notify) => {
    const snapshotOrder = await db.collection("orders").where('jobID', '==', job.id).get();
    for (const doc of snapshotOrder.docs) {
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
    }
}

const cleaningJobSchedule = (io, userSockets) => {

    if (cleaningJobInterval) return;

    cleaningJobInterval = setInterval(async () => {
        
        const { date, time, time30 } = getTimeNotication();

        const snapshot = await db.collection("cleaningJobs").get();

        for (const job of snapshot.docs) {

            const endTime = await getEndTime(job.data().startTime, job.data().durationID, job.data().serviceType);
            const notify = {
                jobID: job.id,
                title: 'Thông báo công việc',
                content: '',
                time: null,
                serviceType: 'CLEANING'
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
};

const healthcareJobSchedule = (io, userSockets) => {

    if (healthcareJobInterval) return;

    healthcareJobInterval = setInterval(async () => {
        
        const { date, time, time30 } = getTimeNotication();

        const snapshot = await db.collection("healthcareJobs").get();

        for (const job of snapshot.docs) {

            const endTime = await getEndTime(job.data().startTime, job.data().durationID, job.data().serviceType);
            const notify = {
                jobID: job.id,
                title: 'Thông báo công việc',
                content: '',
                time: null,
                serviceType: 'HEALTHCARE'
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
};

module.exports = { cleaningJobSchedule, healthcareJobSchedule };